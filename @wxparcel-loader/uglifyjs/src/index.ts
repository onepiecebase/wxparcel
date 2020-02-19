import defaultsDeep from 'lodash/defaultsDeep'
import { ParcelLoader } from 'wxparcel-core'
import UglifyJS from 'uglify-es'
import * as Typings from './typings'

/**
 * Javascript 压缩加载器
 * @param asset 资源对象
 * @param options 配置, 可参考 require('uglify-js').minify 中的配置: https://github.com/mishoo/UglifyJS#usage
 */
const UglifyjsLoader: ParcelLoader = (asset, options: Typings.UglifyjsOptions) => {
  return new Promise((resolve, reject) => {
    const { file, sourceMap } = asset
    const { sourceMap: useSourceMap } = options

    let { content } = asset
    let { options: uglifyOptions } = options

    content = content.toString()

    const defaultOptions: any = {}
    if (useSourceMap !== false && sourceMap) {
      defaultOptions.sourceMap = {
        content: sourceMap,
      }
    }

    uglifyOptions = defaultsDeep({}, uglifyOptions, defaultOptions)

    const result = UglifyJS.minify({ [file]: content }, uglifyOptions)
    const { code, map } = result
    const error: any = result.error

    if (error) {
      const lines = content.split('\n')
      const line = lines[error.line - 1]
      let fragment = line.substr(error.col - 10, 10)
      fragment = `${fragment} ${line.substr(error.col, 100)}\n${new Array(fragment.length + 1).fill(' ').join('')}^`
      error.fragment = fragment

      reject(error)
      return
    }

    const buffer = Buffer.from(code)
    resolve({ code: buffer, map })
  })
}

export default UglifyjsLoader
