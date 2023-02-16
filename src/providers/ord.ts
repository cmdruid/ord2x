export const OrdProvider = {
  _requests : {},
  _pubkey   : undefined,

  _call (
    type   : string, 
    params : Record<string, any>
  ) : Promise<void> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString().slice(8)
      window.ord._requests[id] = { resolve, reject }
      window.postMessage({ id, ext: 'ord2x', type, params }, '*')
    })
  },

  async signWithKey(key : string, data : any) {
    return window.ord._call('signWithKey', { key, data })
  }
}
