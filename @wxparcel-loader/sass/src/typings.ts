import { LoaderOption } from 'wxparcel-core'
import { Options as NodeSassOptions } from 'node-sass'

export interface SassOptions extends LoaderOption {
  options: NodeSassOptions;
}
