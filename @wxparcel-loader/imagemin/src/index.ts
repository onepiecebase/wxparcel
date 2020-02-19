import { ParcelLoader } from 'wxparcel-core'
import imagemin from 'imagemin'
import imageminJpegtran from 'imagemin-jpegtran'
import imageminPngquant from 'imagemin-pngquant'
import * as Typings from './typings'

/**
 * 代码替换加载器
 * @param asset 资源对象
 * @param options 配置
 */
export const ImageMinLoader: ParcelLoader = async (asset, options: Typings.ImageMinOptions) => {
  const { content } = asset
  const { options: loaderOptions } = options

  const plugins = loaderOptions.options && Array.isArray(loaderOptions.options.plugins) ? [].concat(loaderOptions.options.plugins) : []
  loaderOptions.jepg && plugins.unshift(imageminJpegtran(loaderOptions.jepg))
  loaderOptions.png && plugins.unshift(imageminPngquant(loaderOptions.png))

  const imageminOptions = loaderOptions.options ? { ...loaderOptions.options, plugins } : { plugins }
  const code: Buffer = await imagemin.buffer(content as Buffer, imageminOptions)
  const originSize: number = (content as Buffer).byteLength
  const compressedSize: number = code.byteLength
  return originSize > compressedSize ? { code } : { code: content }
}

export default ImageMinLoader
