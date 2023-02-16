import browser        from 'webextension-polyfill'
import { Permission } from '@/types'

import {
  ORDERED_PERMISSIONS,
  PERMISSION_NAMES
} from '@/config'

const store = browser.storage.local

export function getAllowedMethods(level : number) : string[] {
  let requestedMethods : string[] = []
  for (let i = 0; i < ORDERED_PERMISSIONS.length; i++) {
    const [ perm, methods ] = ORDERED_PERMISSIONS[ i ]
    if (perm > level) break
    requestedMethods = requestedMethods.concat(methods)
  }
  return requestedMethods.map(method => PERMISSION_NAMES[ method ])
}

export function getMethodString(level : number) : string {
  let methods = getAllowedMethods(level)
  if (methods.length === 0) return 'none'
  if (methods.length === 1) return methods[0]
  return methods.join(', ')
}

export async function fetchPermissions() : Promise<Record<string, Permission>> {
  const ret = await store.get('permissions')
  return ret.permissions || {}
}

export async function readPermissions() : Promise<Record<string, Permission>> {
  const perms = await fetchPermissions()

  let needsUpdate = false

  for (let host in perms) {
    if (
      perms[host].condition === 'expirable' &&
      isExpired(perms[host].created_at)
    ) {
      delete perms[host]
      needsUpdate = true
    }
  }

  if (needsUpdate) store.set({ permissions: perms })

  return perms
}

function isExpired(timestamp ?: number) {
  if (timestamp === undefined) return true
  return timestamp < Date.now() / 1000 - 5 * 60
}

export async function readPermissionLevel(
  host : string
) : Promise<number> {
  const perms = await readPermissions() 
  return perms[host]?.level || 0
}

export async function updatePermission(
  host : string, 
  perm : Record<string, any>
) : Promise<void> {
  const perms = await fetchPermissions()
  perms[host] = {
    ...perms[host],
    ...perm,
    created_at: Math.round(Date.now() / 1000)
  }
  store.set({ permissions: perms })
}

export async function removePermissions(
  host : string
) : Promise<void> {
  const perms = await fetchPermissions()
  delete perms[host]
  store.set({ permissions: perms })
}
