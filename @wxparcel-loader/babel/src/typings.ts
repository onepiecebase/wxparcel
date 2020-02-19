import { ParcelLoaderOptions } from 'wxparcel-core'
import { TransformOptions } from '@babel/core'

export interface BabelOptions extends ParcelLoaderOptions {
  options: TransformOptions
}
