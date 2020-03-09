import envifyReplace from 'loose-envify/replace'
import { Loader, ChunkState } from 'wxparcel-core'
import * as Typings from './typings'

/**
 * 代码替换加载器
 * @param asset 资源对象
 * @param options 配置
 */
export const EnvifyLoader: Loader = (asset: ChunkState, options: Typings.EnvifyOptions) => {
  return new Promise(resolve => {
    let { content } = asset
    const { options: envifyOptions } = options

    content = content.toString()
    const env = Object.assign({}, process.env, envifyOptions.env)
    let code = envifyReplace(content, [env || process.env])

    code = Buffer.from(code)
    resolve({ code })
  })
}

export default EnvifyLoader
