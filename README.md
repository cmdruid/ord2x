# ord2x

### Notes and other stuff (and ordinals) signed by an extension.

Fork of [nos2x](https://github.com/fiatjaf/nos2x) signing extention. Full credit to fiatjaf.

This project is under heavy development. More coming soon!

## Nostr / HD Signer Extension

Use this to sign [Nostr](https://github.com/nostr-protocol/nostr) events on web-apps without having to give them your keys.

It implements [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md), i.e. provides a `window.nostr` object which has the following methods:

This extention also implements HD wallets, and allows you to import a wallet from Bitcoin core to use for signing.

Using an HD wallet, you can sign / verify that you own UTXOs within the wallet (including taproot UTXOs).

## API

```
async window.nostr.getPublicKey(): string // returns your public key as hex
async window.nostr.signEvent(event): Event // returns the full event object signed
async window.nostr.getRelays(): { [url: string]: RelayPolicy } // returns a map of relays
async window.nostr.nip04.encrypt(pubkey, plaintext): string // returns ciphertext+iv as specified in nip04
async window.nostr.nip04.decrypt(pubkey, ciphertext): string // takes ciphertext+iv as specified in nip04
```

This extension is Chromium-only. Please feel free to fork this extention and make a compatible version for Firefox and other browsers.

## Install

- [Chrome Extension](https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp)

## Develop

To run the plugin from this code:

```
git clone https://github.com/cmdruid/ord2x
cd ord2x
yarn install
yarn run build
```

Once built:

1. Go to `chrome://extensions`;
2. Ensure "developer mode" is enabled on the top right;
3. Click on `Load unpackaged`;
4. Select the `extension/` folder of this repository.

---

LICENSE: public domain.
