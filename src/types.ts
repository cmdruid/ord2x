declare global {
  interface Window {
    ord : {
      _call     : (type: string, params: Record<string, any>) => Promise<void>
      _pubkey  ?: string
      _requests : Record<string, OpenPrompt>
    }
  }
}

export interface Permission {
  host        : string
  condition   : string
  created_at  : number
  level       : number
}

export interface OpenPrompt {
  resolve : (value  ?: any) => void
  reject  : (reason ?: any) => void
}