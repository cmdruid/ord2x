/* global BigInt */

import { Hex }  from '@cmdcode/buff-utils'
import HDWallet from '@cmdcode/keylink'
import { Field, Hash, Point } from '@cmdcode/crypto-utils'

export async function getTweakedKey(
  hd  : HDWallet,
  key : string
) {

  const LIMIT = 100

  for (let i = 0; i < LIMIT; i++) {
    hd = await hd.getPath(String(i))
    const pubkey = Hex.encode(hd.publicKey.slice(1))
    if (pubkey === key) {
      return hd
    }
    const [ tweaked ] = await taproot_tweak_pubkey(key)
    const tweakedPub  = Hex.encode(tweaked.slice(1))

    if (tweakedPub === key) {
      return hd
    }
  }
  return undefined
}

async function taproot_tweak_pubkey (
  pubkey : Uint8Array | string,
  tweak ?: Uint8Array | string
) : Promise<[ Uint8Array, boolean ]> {
  if (tweak !== undefined) {
    tweak = Hex.normalize(tweak)
  }
  pubkey = Hex.normalize(pubkey)
  const t = await getTweak("TapTweak", pubkey, tweak)
  const P = Point.fromXOnly(pubkey)
  const Q = P.add(new Field(t).point)
  return [ Q.rawX.slice(1), Q.hasOddY ]
}

async function getTag(tag : string) {
  const ec  = new TextEncoder()
  const raw = ec.encode(tag)
  return Uint8Array.of(...await Hash.sha256(raw), ...await Hash.sha256(raw))
}

async function getTweak(
  tag    : string,
  pubkey : Uint8Array,
  tweak ?: Uint8Array
) {
  let buff = Uint8Array.of(...await getTag(tag), ...pubkey)
  if (tweak !== undefined) buff = Uint8Array.of(...buff, ...tweak)
  return Hash.sha256(buff)
}
