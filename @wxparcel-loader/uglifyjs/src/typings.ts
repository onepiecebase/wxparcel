import { ParcelOptions } from 'wxparcel-core'
import { MinifyOptions } from 'uglify-es'

export interface UglifyjsOptions extends ParcelOptions {
  options: MinifyOptions;
}
