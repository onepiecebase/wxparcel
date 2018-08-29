import ip from 'ip'
import fs from 'fs-extra'
import path from 'path'
import portscanner from 'portscanner'
import isEmpty from 'lodash/isEmpty'
import mapValues from 'lodash/mapValues'
import Printer from './printer'

/**
 * 配置管理器
 *
 * @export
 * @class OptionManager
 */
export class OptionManager {
  /**
   * Creates an instance of OptionManager.
   * @param {Object} [options={}] 初始化配置
   */
  constructor (options = {}) {
    /**
     * 根目录
     *
     * @type {String}
     */
    this.rootDir = process.cwd()

    /**
     * 运行根目录
     *
     * @type {String}
     */
    this.execDir = path.join(__dirname, '../')

    !isEmpty(options) && this.resolve(options)
  }

  /**
   * 解析配置并保存起来
   *
   * @param {Object} [options={}] 配置
   */
  async resolve (options = {}) {
    /**
     * 闲置端口
     *
     * @type {Number}
     */
    let idlePort = await portscanner.findAPortNotInUse(50000, 60000)

    /**
     * 原文件存放目录
     *
     * @type {String}
     */
    this.srcDir = path.join(this.rootDir, options.src || 'src')

    /**
     * 输出文件存放目录
     *
     * @type {String}
     */
    this.outDir = path.join(this.rootDir, options.output || 'app')

    /**
     * 静态文件存放目录
     *
     * @type {String}
     */
    this.staticDir = path.join(this.rootDir, options.static || 'static')

    /**
     * 临时文件存放目录
     *
     * @type {String}
     */
    this.tmplDir = path.join(this.rootDir, options.tmpl || '.temporary')

    /**
     * 公共服务路径
     *
     * @type {String}
     */
    this.pubPath = options.publicPath || `http://${ip.address()}:${idlePort}`

    /**
     * node_module 存放目录
     *
     * @type {String}
     */
    this.npmDir = options.nodeModuleDirectoryName || 'npm'

    /**
     * 规则集合
     *
     * @type {Array}
     */
    this.rules = options.rules || []

    /**
     * 插件集合
     *
     * @type {Array}
     */
    this.plugins = options.plugins || []

    /**
     * 是否为监听状态
     *
     * @type {Boolean}
     */
    this.watching = options.watch || false

    /**
     * 是否位安静模式
     *
     * @type {Boolean}
     */
    this.silence = options.silence || process.argv.indexOf('--quiet') !== -1

    /**
     * 微信小程序 app.config.json 文件配置
     *
     * @type {Object}
     */
    this.appConfig = {}

    if (!/https?:\/\//.test(this.pubPath)) {
      throw new TypeError(`publicPath 为 ${this.pubPath}, 微信小程序并不能访问非远程的静态资源`)
    }

    let valid = this.checkRules(this.rules)
    if (valid !== true) {
      throw new TypeError(valid)
    }

    let wxAppConfFile = path.join(this.srcDir, './app.json')
    this.resolveWXAppConf(wxAppConfFile)

    if (!(Array.isArray(this.appConfig.pages) && this.appConfig.pages.length > 0)) {
      throw new Error('没有找到入口页面, 请检查 app.json 中的 pages 属性')
    }
  }

  /**
   * 验证规则是否符合规范
   *
   * @param {Array} [rules=[]] 规则集合
   * @return {Boolean} 是否通过验证
   */
  checkRules (rules = []) {
    for (let i = rules.length; i--;) {
      let rule = rules[i]
      let mkTips = () => {
        let tmpRule = Object.assign({}, rule)
        tmpRule.test = String(tmpRule.test)
        return `please check this rule:\n${JSON.stringify({ rule: tmpRule }, null, 2)}`
      }

      if (!rule.hasOwnProperty('test') || !rule.test) {
        return `Option test is not provided, ${mkTips()}`
      }

      if (!(rule.test instanceof RegExp)) {
        return `Option test is not a regexp, ${mkTips()}`
      }

      if (!rule.hasOwnProperty('loaders') || !rule.loaders) {
        return `Option loaders is not provied, ${mkTips()}`
      }

      if (!Array.isArray(rule.loaders)) {
        return `Option loaders is not a array, ${mkTips()}`
      }

      for (let i = rule.loaders.length; i--;) {
        let loader = rule.loaders[i]
        if (!loader.hasOwnProperty('use') || !loader.use) {
          return `Options use is not a provided, ${mkTips()}`
        }
      }
    }

    return true
  }

  /**
   * 解析微信 app.config.js 文件
   *
   * @param {String} file 文件名
   */
  resolveWXAppConf (file) {
    if (!fs.existsSync(file)) {
      let message = `File ${file} is not found, please ensure ${file} is valid.`
      Printer.error(message)
      throw new Error(message)
    }

    try {
      this.appConfig = fs.readJSONSync(file)
    } catch (error) {
      let message = `File ${file} is invalid json, please check the json corrected.\n${error}`
      Printer.error(message)
      throw new Error(message)
    }

    this.appConfigFile = file
  }

  /**
   * 连接配置数据源到某一对象中
   * OptionManager 中的配置信息都会赋值到
   * 目标配置上, 且数据元都是只可读
   *
   * @param {Object} [options={}] 配置
   * @return {Object} 返回该配置
   */
  connect (options = {}) {
    let getter = mapValues(this, (_, name) => ({
      get: () => this[name]
    }))

    options = Object.assign({}, options)
    return Object.defineProperties(options, getter)
  }
}

export default new OptionManager()
