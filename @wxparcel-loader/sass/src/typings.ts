import { ParcelLoaderOptions } from 'wxparcel-core'
import { Options as NodeSassOptions } from 'node-sass'

export interface SassOptions extends ParcelLoaderOptions {
  options: NodeSassOptions
}
