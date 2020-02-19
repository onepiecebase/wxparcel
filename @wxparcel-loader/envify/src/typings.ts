import { ParcelLoaderOptions } from 'wxparcel-core'

export interface EnvifyOptions extends ParcelLoaderOptions {
  options: {
    env: any
  }
}
