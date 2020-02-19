import fs from 'fs-extra'
import template from 'lodash/template'
import defaultsDeep from 'lodash/defaultsDeep'
import { OptionManager, ParcelPlugin } from 'wxparcel-core'
import * as Typings from './typings'

const remove = fs.remove.bind(fs)

/**
 * 清除插件
 */
export default class CleanPlugin implements ParcelPlugin {
  /**
   * 配置
   */
  public options: Typings.CleanPluginOptions

  constructor(options: any) {
    this.options = defaultsDeep({}, options)
  }

  /**
   * 编译器运行
   * @param options 配置
   * @param options.alisas 别名文件, 例如 srcDir, rootDir, outDir 可以通过 OptionManager 获取到
   */
  public async applyBefore(options: OptionManager) {
    const conf: Typings.CleanPluginOptions & OptionManager = defaultsDeep({}, options, this.options)
    const alisas = conf.alisas || []
    const files = []

    alisas.forEach(alisa => {
      const renderer = template(`<%= ${alisa} %>`)
      const file = renderer(options)
      file && files.push(file)
    })

    const tasks = files.map(file => remove(file))
    await Promise.all(tasks)
  }
}
