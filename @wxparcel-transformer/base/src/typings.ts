export interface TransformerParams {
  file: string
  source: Buffer
}

export interface TransformerResult {
  code: Buffer
  map: Object
  ast: Object
  dependencies: string[]
}

export interface Alias {
  [key: string]: string[]
}
