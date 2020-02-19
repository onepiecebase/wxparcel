import fs from 'fs'
import path from 'path'
import { transform } from '@babel/core'
import { ParcelLoader } from 'wxparcel-core'
import * as Typings from './typings'

/**
 * Babel 加载器
 * @param asset 资源对象
 * @param options 配置, 配置参考 require('@babel/core').transform 中的配置, https://babeljs.io/docs/en/next/babel-core.html
 */
export const BabelLoader: ParcelLoader = async (asset, options: Typings.BabelOptions) => {
  return new Promise(resolve => {
    const file = asset.file
    const useSourceMap = options.sourceMap

    let { content } = asset
    let { options: babelOptions } = options
    const babelrc = path.join(options.rootDir, '.babelrc')

    content = content.toString()

    if (fs.existsSync(babelrc)) {
      const defaultOptions = {
        comments: false,
        sourceRoot: 'local',
        sourceFileName: file.replace(options.srcDir + path.sep, '').replace(/\\/g, '/'),
        sourceMaps: true,
        extends: babelrc,
        babelrc: true,
      }

      if (useSourceMap !== false) {
        Object.assign(defaultOptions, {
          sourceRoot: 'local',
          sourceFileName: file.replace(options.srcDir + path.sep, '').replace(/\\/g, '/'),
          sourceMaps: true,
        })
      }

      babelOptions = Object.assign({}, defaultOptions, babelOptions)
    }

    const regexp = /require\(["'\s]+(.+?)["'\s]+\)/g
    const result = transform(content, babelOptions)
    const map = result.map

    let code = result.code
    let surplus = code
    let match = null

    // tslint:disable-next-line:no-conditional-assignment
    while ((match = regexp.exec(surplus))) {
      const [all, path] = match
      surplus = surplus.replace(all, '')
      code = code.replace(all, `require('${path.replace(/\\/g, '/')}')`)
    }

    resolve({ code, map })
  })
}

export default BabelLoader
