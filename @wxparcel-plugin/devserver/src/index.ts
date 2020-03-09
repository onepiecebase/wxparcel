import http, { ServerResponse } from 'http'
import ipPortRegex from 'ip-port-regex'
import Finalhandler from 'finalhandler'
import ServeStatic from 'serve-static'
import defaultsDeep from 'lodash/defaultsDeep'
import { OptionManager, Plugin, NonFunctionProperties } from 'wxparcel-core'
import * as Typings from './typings'

/**
 * 静态服务插件
 */
export default class DevServerPlugin implements Plugin {
  /**
   * 配置
   */
  public options: Typings.DevServerOptions

  constructor(options: Typings.DevServerOptions = {}) {
    this.options = defaultsDeep({}, options)
  }

  /**
   * 允许跨域
   * @param response 返回内容
   */
  public enableCors(response: ServerResponse) {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE')

    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Content-Type')
  }

  /**
   * 设置头部
   *
   * @param response 返回内容
   */
  public setHeaders(response: ServerResponse) {
    this.enableCors(response)
  }

  /**
   * 在编译过程中异步执行
   *
   * @param options 配置
   */
  public async applyAsync(options: NonFunctionProperties<OptionManager>) {
    const config: Typings.DevServerOptions & NonFunctionProperties<OptionManager> = defaultsDeep(options, this.options)

    if (config.watching === false) {
      return Promise.resolve()
    }

    const { staticDir, pubPath } = config
    const settings = {
      index: false,
      setHeaders: this.setHeaders.bind(this),
    }

    const serverOptions = Object.assign(settings, config)
    const serve = ServeStatic(staticDir, serverOptions)
    const server = http.createServer((request, response) => {
      serve(request as any, response as any, Finalhandler(request, response))
    })

    const match = ipPortRegex.parts(pubPath) || {}
    const port = config.port || match.port
    server.listen(port, '0.0.0.0')

    server.on('error', error => console.error(error))
  }
}
