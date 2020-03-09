import { LoaderOption } from 'wxparcel-core'
import { TransformOptions } from '@babel/core'

export interface BabelOptions extends LoaderOption {
  options: TransformOptions;
}
