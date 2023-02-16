import { OrdProvider } from './providers/ord.js'

window.ord = OrdProvider

window.addEventListener('message', message => {
  if (message.data === undefined) return

  const { response, ext, id } = message.data

  const requests = window.ord._requests

  if (
    response === null      || 
    response === undefined ||
    ext !== 'ord2x'        ||
    requests[id] === undefined
  ) return

  if (response.error !== undefined) {
    const error = new Error('ord2x: ' + response.error.message)
    error.stack = response.error.stack
    requests[id].reject(error)
  } else {
    requests[id].resolve(response)
  }

  delete requests[id]
})

// hack to replace nostr:nprofile.../etc links with something else
// let replacing = null
// document.addEventListener('mousedown', replaceNostrSchemeLink)
// async function replaceNostrSchemeLink(e) {
//   if (e.target.tagName !== 'A' || !e.target.href.startsWith('nostr:')) return
//   if (replacing === false) return

//   let response = await window.nostr._call('replaceURL', {url: e.target.href})
//   if (response === false) {
//     replacing = false
//     return
//   }

//   e.target.href = response
// }
