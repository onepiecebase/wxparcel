import { Options as ImageminOptions } from 'imagemin'
import { Options as JpegtranOptions } from 'imagemin-jpegtran'
import { Options as PngquantOptions } from 'imagemin-pngquant'
import { localRequire } from '../share/module'
import * as Typings from '../typings'

interface ImageMinOptions extends Typings.ParcelLoaderOptions {
  options: {
    jepg: JpegtranOptions,
    png: PngquantOptions,
    options: ImageminOptions
  }
}

/**
 * 代码替换加载器
 * @param asset 资源对象
 * @param options 配置
 */
const ImageMinLoader: Typings.ParcelLoader = async (asset, options: ImageMinOptions) => {
  const { content } = asset
  const { options: loaderOptions } = options || {}

  const promises = ['imagemin', 'imagemin-jpegtran', 'imagemin-pngquant'].map((dep) => localRequire(dep))
  const [imagemin, imageminJpegtran, imageminPngquant] = await Promise.all(promises).then((plugins) => plugins.map((plugin) => plugin.default || plugin))

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
