import fs from 'fs-extra'
import path from 'path'
import get from 'lodash/get'
import uniq from 'lodash/uniq'
import flatten from 'lodash/flatten'
import forEach from 'lodash/forEach'
import isPlainObject from 'lodash/isPlainObject'
import Resolver from './resolver'
import * as Typings from '../typings'

const JSON_REGEXP = /\.json$/
const JS_REGEXP = /\.js$/
const WXML_REGEXP = /\.wxml$/
const WXSS_REGEXP = /\.wxss$/

/**
 * JSON 解析器
 */
export default class JSONResolver extends Resolver {
  /**
   * 解析, 并返回文件,代码,依赖等信息
   * @returns 包括文件, 代码, 依赖
   */
  public resolve() {
    let config: Typings.WXProjectConfig & Typings.WXPageConfig & Typings.WXPluginConfig = {}

    if (this.source instanceof Buffer) {
      this.source = this.source.toString()
    }

    if (isPlainObject(this.source)) {
      config = this.source as any
    } else {
      try {
        const source = this.source
        config = JSON.parse(source)
      } catch (error) {
        throw new Error(`File ${this.file} is invalid json, please check the json corrected.\n${error}`)
      }
    }

    /**
     * 小程序页面配置关键属性
     * @link https://developers.weixin.qq.com/miniprogram/dev/framework/config.html#%E5%85%A8%E5%B1%80%E9%85%8D%E7%BD%AE
     */
    let pages = config.pages || []

    /**
     * 微信小程序分包加载配置关键属性
     * @description 官网文档是小写, 官方 demo 是大写, 这里做一下兼容
     * @link https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages.html
     */
    const subPackages = config.subPackages || config.subpackages || []
    const usingComponents = config.usingComponents || {}

    /**
     * 微信小程序插件配置关键属性
     * @link https://developers.weixin.qq.com/miniprogram/dev/framework/plugin/development.html
     */
    const publicComponents = config.publicComponents || {}
    const tabs = get(config, 'tabBar.list', [])
    const subPages = flatten(
      subPackages.map(item => {
        const rootPath = item.root
        const pages = item.pages || []

        if (rootPath && pages.length > 0) {
          return pages.map(page => path.join(rootPath, page))
        }

        return pages
      })
    )

    pages = pages.concat(subPages)

    const pageModules = this.resolvePages(pages)
    const usingComponentModules = this.resolveComponents(usingComponents)
    const publicComponentModules = this.resolveComponents(publicComponents)
    const tabImageFiles = this.resolveTabs(tabs)
    const confDependedFiles = this.resolveProjectConf(config)

    let files = pageModules.concat(usingComponentModules, publicComponentModules).map(item => item.files)
    files = flatten(files)
    files = uniq(files).concat(tabImageFiles, confDependedFiles)

    const dependencies: Typings.ChunkDependency[] = files.map(dependency => {
      const destination = this.convertDestination(dependency)
      return { file: this.file, dependency, destination, required: '' }
    })

    config = this.convertProjectConf(config)

    const source = JSON.stringify(config, null, process.env.NODE_ENV === 'production' ? 0 : 2)
    const buffer = Buffer.from(source)
    return { file: this.file, content: buffer, dependencies }
  }

  /**
   * 解析项目配置
   * @param config 配置
   * @returns 配置
   */
  public convertProjectConf<T extends Typings.WXProjectConfig>(config: T): T {
    const { outDir } = this.options
    const name = path.basename(outDir)

    if (config.hasOwnProperty('miniprogramRoot')) {
      const folder = config.miniprogramRoot.replace(name, '')
      config.miniprogramRoot = path.join('.', folder).replace(/[\\/]+/g, '/')
    }

    if (config.hasOwnProperty('pluginRoot')) {
      const folder = config.pluginRoot.replace(name, '')
      config.pluginRoot = path.join('.', folder).replace(/[\\/]+/g, '/')
    }

    return config
  }

  /**
   * 解析项目配置
   * @param config 配置
   * @returns 入口文件集合
   */
  public resolveProjectConf(config: Typings.WXProjectConfig = {}): string[] {
    const { srcDir } = this.options

    const files = []
    if (config.hasOwnProperty('pluginRoot')) {
      const { pluginRoot } = config
      const file = path.join(srcDir, pluginRoot, 'plugin.json')
      fs.existsSync(file) && files.push(file)
    }

    if (config.hasOwnProperty('main')) {
      const { projectConfig } = this.options
      if (projectConfig.hasOwnProperty('pluginRoot')) {
        const { pluginRoot } = projectConfig
        const file = path.join(srcDir, pluginRoot, config.main)
        fs.existsSync(file) && files.push(file)
      }
    }

    return files
  }

  /**
   * 解析页面配置
   * @param pages 页面配置
   * @returns 页面集合
   */
  public resolvePages(pages) {
    const relativePath = path.dirname(this.file)

    pages = pages.map(page => {
      page = path.join(relativePath, page)

      const folder = path.dirname(page)
      if (!fs.existsSync(folder)) {
        throw new Error(`查找不到文件夹 ${folder}`)
      }

      const name = path.basename(page)
      return this.findModule(name, folder)
    })

    return pages
  }

  /**
   * 解析组件配置
   * @param components 组件
   */
  public resolveComponents(components) {
    const relativePath = path.dirname(this.file)
    const outputs = []

    forEach(components, component => {
      const realtiveFolder = path.dirname(component)
      const folder = this.convertRelative(realtiveFolder, [relativePath, this.options.srcDir])

      if (folder !== false) {
        const name = path.basename(component)
        outputs.push(this.findModule(name, folder as string))
      }
    })

    return outputs
  }

  /**
   * 解析配置需要的图片
   * @param tabs Tab
   * @returns 图片集合
   */
  public resolveTabs(tabs): string[] {
    const images = []
    const basePath = path.dirname(this.file)

    tabs.forEach(({ iconPath, selectedIconPath }) => {
      if (iconPath) {
        iconPath = path.join(basePath, iconPath)
        images.indexOf(iconPath) === -1 && images.push(iconPath)
      }

      if (selectedIconPath) {
        selectedIconPath = path.join(basePath, selectedIconPath)
        images.indexOf(selectedIconPath) === -1 && images.push(selectedIconPath)
      }
    })

    return images
  }

  /**
   * 转换相对路径
   * @description
   * 用于查找文件是否存在
   * 通过传入路径 paths, 查找相对路径的 file
   * 在某一路径是否存在, 存在返回路径地址, 不存在返回  false
   * @param file 文件路径
   * @param paths 路径集合
   * @returns 路径地址或 false
   */
  public convertRelative(file: string, paths: string[]): string | boolean {
    if (!Array.isArray(paths) || paths.length === 0) {
      throw new Error('Paths is not a array or not be provided')
    }

    for (let i = 0; i < paths.length; i++) {
      const dir = paths[i]
      const target = path.join(dir, file)

      if (fs.existsSync(target)) {
        return target
      }
    }

    return false
  }

  /**
   * 查找模块
   * @description
   * 这里的模块是指 微信小程序 指定的 page, component 等
   * 拥有相对规范的一个组合; 通过此方法可以查找到配置对应的
   * Page, component 的路径与所包含对应的文件集合
   * @param name 模块名称
   * @param folder 路径
   * @returns 包括模块名称,模块路径,模块所包含符合要求的文件
   */
  public findModule(name: string, folder: string) {
    if (!folder) {
      throw new TypeError('Folder is not provided')
    }

    if (!fs.statSync(folder).isDirectory()) {
      throw new Error(`Folder ${folder} is not found or not a folder`)
    }

    let files = fs.readdirSync(folder)
    const regexp = new RegExp(name)

    files = files.filter(file => {
      if (!regexp.test(path.basename(file))) {
        return false
      }

      const tester = [JSON_REGEXP, JS_REGEXP, WXML_REGEXP, WXSS_REGEXP]
      const index = tester.findIndex(regexp => regexp.test(file))
      if (index !== -1) {
        return true
      }

      const { rules } = this.options
      if (Array.isArray(rules)) {
        const index = rules.findIndex(rule => rule.test.test(file))
        if (index !== -1) {
          return true
        }
      }
    })

    files = files.map(file => path.join(folder, file))
    return { name, dir: folder, files }
  }
}
