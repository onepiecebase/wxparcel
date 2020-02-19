import { MinifyOptions } from 'uglify-es'
import { ParcelLoaderOptions } from 'wxparcel-core'

export interface UglifyjsOptions extends ParcelLoaderOptions {
  options: MinifyOptions
}
