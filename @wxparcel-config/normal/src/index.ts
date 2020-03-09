/**
 * 默认配置, 自定义配置可以参考这里
 */

import BabelLoader from 'wxparcel-loader-babel'
import EnvifyLoader from 'wxparcel-loader-envify'
import UglifyJSLoader from 'wxparcel-loader-uglifyjs'
import SassLoader from 'wxparcel-loader-sass'
import CleanPlugin from 'wxparcel-plugin-clean'
import DevServerPlugin from 'wxparcel-plugin-devserver'
import { BUNDLER, SCATTER, RuleOption, Plugin } from 'wxparcel-core'

// JS 规则
const jsRules: RuleOption[] = [
  {
    test: /\.js$/,
    extname: '.js',
    loaders: [
      {
        use: BabelLoader,
      },
      {
        use: EnvifyLoader,
        options: {
          env: {
            NODE_ENV: process.env.NODE_ENV,
          },
        },
      },
    ],
  },
]

// wxss 规则
const wxssRules: RuleOption[] = [
  {
    test: /\.scss$/,
    extname: '.wxss',
    loaders: [
      {
        use: SassLoader,
        options: {},
      },
    ],
  },
]

// 插件配置
const plugins: Plugin[] = [
  new CleanPlugin({
    alisas: ['outDir', 'staticDir', 'tmplDir'],
  }),
]

// 开发环境下配置
if (process.env.NODE_ENV === 'development') {
  plugins.push(new DevServerPlugin())
}

// 测试或生产配置
if (process.env.NODE_ENV === 'prerelease' || process.env.NODE_ENV === 'production') {
  jsRules[0].loaders.push({
    use: UglifyJSLoader,
    for: [BUNDLER, SCATTER],
    options: {},
  })
}

class Config {
  /**
   * 获取所有JS规则
   * @readonly
   */
  public get jsRules() {
    return [...jsRules]
  }

  /**
   * 获取所有WXSS规则
   * @readonly
   */
  public get wxssRules() {
    return [...wxssRules]
  }

  /**
   * 获取所有规则
   * @readonly
   */
  public get rules() {
    return [...jsRules, ...wxssRules]
  }

  /**
   * 获取所有插件
   * @readonly
   */
  public get plugins() {
    return [...plugins]
  }

  /**
   * 获取真正的配置
   */
  public get source() {
    const { rules, plugins } = this
    return { rules, plugins }
  }

  /**
   * 设置规则
   * @param name 规则名称
   * @param callback 回调
   */
  public setRule(name: string, callback: (rules: RuleOption[]) => RuleOption[]): void {
    switch (name) {
      case 'js': {
        const rules = jsRules || []
        jsRules.splice(0)
        jsRules.push(...callback(rules))
        break
      }

      case 'wxss': {
        const rules = wxssRules || []
        wxssRules.splice(0)
        wxssRules.push(...callback(rules))
        break
      }
    }
  }

  /**
   * 添加插件
   * @param plugin 插件
   */
  public addPlugin(plugin: Plugin): void {
    plugins.push(plugin)
  }

  /**
   * 删除插件
   * @param plugin 插件
   */
  public delPlugin(plugin: { new (): Plugin } | Plugin): void {
    const index = plugins.findIndex(item => (typeof plugin === 'function' ? item === plugin : item.constructor === plugin.constructor))
    index !== -1 && plugins.splice(index, 1)
  }

  public toSource() {
    return this.source
  }

  public toString() {
    return JSON.stringify(this.source)
  }
}

export default new Config()
