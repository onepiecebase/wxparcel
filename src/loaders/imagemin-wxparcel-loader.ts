import { Options as ImageminOptions } from 'imagemin'
import { Options as JpegOptions } from 'imagemin-jpegtran'
import Pngquant from 'imagemin-pngquant'
import { localRequire } from '../share/module'
import * as Typings from '../typings'

type Nth<T extends any[], S extends number> = T[S]
type PngOptions = Nth<Parameters<typeof Pngquant>, 0>

interface ImageMinOptions extends Typings.ParcelLoaderOptions {
  options: {
    jepg?: JpegOptions,
    png?: PngOptions,
    options?: ImageminOptions
  }
}

/**
 * 代码替换加载器
 * @param asset 资源对象
 * @param options 配置
 */
const ImageMinLoader: Typings.ParcelLoader = async (asset, options: ImageMinOptions) => {
  const { content } = asset
  const { options: loaderOptions, rootDir } = options

  const modules = await localRequire(['imagemin', 'imagemin-jpegtran', 'imagemin-pngquant'], rootDir, true)
  const [imagemin, imageminJpegtran, imageminPngquant] = modules.map((module) => module.default || module)

  const plugins = loaderOptions.options && Array.isArray(loaderOptions.options.plugins) ? [].concat(loaderOptions.options.plugins) : []
  loaderOptions.jepg && plugins.unshift(imageminJpegtran(loaderOptions.jepg))
  loaderOptions.png && plugins.unshift(imageminPngquant(loaderOptions.png))

  const imageminOptions = loaderOptions.options ? { ...loaderOptions.options, plugins } : { plugins }
  const code: Buffer = await imagemin.buffer(content, imageminOptions)
  const originSize: number = (content as Buffer).byteLength
  const compressedSize: number = code.byteLength
  return originSize > compressedSize ? { code } : { code: content }
}

export default ImageMinLoader
