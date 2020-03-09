import { LoaderOption } from 'wxparcel-core'
import { Options as ImageminOptions } from 'imagemin'
import { Options as JpegOptions } from 'imagemin-jpegtran'
import Pngquant from 'imagemin-pngquant'

export type Nth<T extends any[], S extends number> = T[S]
export type PngOptions = Nth<Parameters<typeof Pngquant>, 0>

export interface ImageMinOptions extends LoaderOption {
  options: {
    jepg?: JpegOptions;
    png?: PngOptions;
    options?: ImageminOptions;
  };
}
