import { Loader, ChunkState } from 'wxparcel-core'
import { render, SassError, Result as SassResult } from 'node-sass'
import * as Typings from './typings'

/**
 * Sass 加载器
 * @param asset 资源对象
 * @param options 配置, 可参考 require('node-sass').redner 中的配置: https://github.com/sass/node-sass#options
 */
export const SassLoader: Loader = (asset: ChunkState, options: Typings.SassOptions) => {
  return new Promise((resolve, reject) => {
    const { content } = asset
    const { tmplDir, rootDir, srcDir } = options
    const { file, options: sassOptions } = options

    const data = content.toString()
    const params = { file, data }

    const defaultOptions = {
      includePaths: [tmplDir, rootDir, srcDir],
      outputStyle: 'compressed',
      sourceComments: false,
      sourceMap: true,
    }

    render(Object.assign({}, defaultOptions, sassOptions, params), (error: SassError, result: SassResult) => {
      if (error) {
        reject(error)
        return
      }

      const { css: code, map, stats } = result
      const dependencies = stats.includedFiles || []
      resolve({ code, map, dependencies })
    })
  })
}

export default SassLoader
