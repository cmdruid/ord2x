type PermRecord = [
  level : number,
  label : string[]
]

export const ORDERED_PERMISSIONS : PermRecord[] = [
  [ 10, ['signWithKey' ] ]
]

export const NO_PERMISSIONS_REQUIRED : Record<string, any> = {
  replaceURL: true
}

export const PERMISSIONS_REQUIRED : Record<string, number> = {
  signWithKey: 10,
}

export const PERMISSION_NAMES : Record<string, string> = {
  signWithKey  : 'sign a data payload using the requested key-pair.',
}
