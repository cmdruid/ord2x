import browser   from 'webextension-polyfill'
import { Mutex } from 'async-mutex'
import { OpenPrompt } from './types.js'

import {
  PERMISSIONS_REQUIRED,
  NO_PERMISSIONS_REQUIRED,
} from './config.js'

import {
  readPermissionLevel,
  updatePermission
} from './access.js'

import { privateHandler } from './handlers/privateHandler.js'

interface AllowPrompt {
  id       ?: string
  condition : string
  host     ?: string
  level    ?: number
}

interface EventMessage {
  host   : string
  type   : string
  params : any
}

let openPrompt : OpenPrompt | undefined
let promptMutex = new Mutex()
let releasePromptMutex = () => {}

browser.runtime.onInstalled.addListener(details => {
  // Open options page when first installed.
  if (details.reason === 'install') browser.runtime.openOptionsPage()
})

browser.runtime.onMessage.addListener(async (req, sender) => {
  // Handle incoming messages.
  let { prompt } = req
  if (prompt) {
    return handlePromptMessage(req, sender)
  } else {
    return handleContentScriptMessage(req)
  }
})

browser.runtime.onMessageExternal.addListener(
  async (message, sender) => {
    const { type, params } = message
    if (sender?.url !== undefined) {
      return handleContentScriptMessage({
        type,
        params,
        host: new URL(sender.url).host
      })
    }
    return
  }
)

browser.windows.onRemoved.addListener(_windowId => {
  if (openPrompt !== undefined) {
    handlePromptMessage({ condition: 'no' })
  }
})

async function handleContentScriptMessage(
  { type, params, host } : EventMessage
) {
  if (NO_PERMISSIONS_REQUIRED[type]) {
    // authorized, and we won't do anything with private key here, so do a separate handler
    // switch (type) {}
    return
  } else {
    const level = await readPermissionLevel(host)

    if (level >= PERMISSIONS_REQUIRED[type]) {
      // authorized, proceed
    } else {
      // ask for authorization
      try {
        await promptPermission(host, PERMISSIONS_REQUIRED[type], params)
        // authorized, proceed
      } catch (_) {
        // not authorized, stop here
        return {
          error: `insufficient permissions, required ${PERMISSIONS_REQUIRED[type]}`
        }
      }
    }
  }

  try {
    return // privateHandler(type, params)
  } catch (error : any) {
    return { error: { message: error.message, stack: error.stack }}
  }
}

function handlePromptMessage(
  { condition, host, level } : AllowPrompt, 
  sender ?: browser.Runtime.MessageSender
) {
  switch (condition) {
    // case 'forever':
    case 'expirable':
      if (
        typeof host  === 'string' &&
        typeof level === 'number'
      ) {
        openPrompt?.resolve?.()
        updatePermission(host, { level, condition })
      } else { openPrompt?.reject?.() }
      break
    case 'single':
      openPrompt?.resolve?.()
      break
    case 'reject':
      openPrompt?.reject?.()
      break
    default:
      openPrompt?.reject?.()
  }

  openPrompt = undefined
  releasePromptMutex()

  if (sender?.tab?.windowId !== undefined) {
    browser.windows.remove(sender.tab.windowId)
  }
}

async function promptPermission(
  host   : string, 
  level  : number, 
  params : Record<string, any>
) : Promise<browser.Windows.Window> {
  releasePromptMutex = await promptMutex.acquire()

  const id    = Math.random().toString().slice(8)
  const query = new URLSearchParams({
    id,
    host,
    level  : String(level),
    params : JSON.stringify(params)
  })

  return new Promise((resolve, reject) => {
    openPrompt = { resolve, reject }

    browser.windows.create({
      url    : `${ browser.runtime.getURL('dist/prompt.html')}?${query.toString()} `,
      type   : 'popup',
      width  : 340,
      height : 330
    })
  })
}
