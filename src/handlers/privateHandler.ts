import browser  from 'webextension-polyfill'
import HDWallet from '@cmdcode/keylink'
import { getTweakedKey } from '@/lib/tweak'

export async function privateHandler(
  type   : string,
  params : Record<string, any>
) {
  const store   = browser.storage.local
  const results = await store.get('private_key')

  if (results?.private_key === undefined) {
    return { error: 'no private key found' }
  }

  let hd = await HDWallet.fromBase58(results.private_key).getPath('1')

  switch (type) {
    case 'signWithKey': {
      let { key, data } = params

      if (typeof data === 'object') {
        try { data = JSON.stringify(data) }
        catch { throw 'Failed to convert JSON object to string!' }
      }

      if (
        typeof key  === 'string' &&
        typeof data === 'string'
      ) {
        const ret = await getTweakedKey(hd, key)
        if (ret !== undefined) {
          return ret.schnorr.sign(data, key)
        }
      }

      throw 'Must provide valid public key and data!'
    }
  }
  return
}
