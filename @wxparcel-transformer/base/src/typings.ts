export interface ParseParams {
  file: string
  source: Buffer
}

export interface ParseResult {
  code: Buffer
  map: Object
  ast: Object
  dependencies: string[]
}

export interface ParseAlias {
  [key: string]: string[]
}
