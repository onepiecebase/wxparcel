import { WXProjectConfig } from './wx'
import { RuleOption } from './rule'

export interface Option {
  /**
   * 空闲端口
   */
  idlePort: number;

  /**
   * 根目录
   */
  rootDir: string;

  /**
   * 运行根目录
   */
  execDir: string;

  /**
   * 原文件存放目录
   */
  srcDir: string;

  /**
   * 输出文件存放目录
   */
  outDir: string;

  /**
   * 静态文件存放目录
   */
  staticDir: string;

  /**
   * 临时文件存放目录
   */
  tmplDir: string;

  /**
   * 公共服务路径
   */
  pubPath: string;

  /**
   * node_module 存放目录
   */
  npmDir: string;

  /**
   * 运行环境
   */
  env: string;

  /**
   * 日志输出类型
   */
  stats?: 'none' | 'error' | 'verbose';

  /**
   * 日志类型
   */
  logType: Array<'console' | 'file'> | 'console' | 'file';

  /**
   * 日志级别
   */
  logLevel: 'none' | 'error' | 'warning' | 'verbose';

  /**
   * 编译规则
   */
  rules: RuleOption[];

  /**
   * 是否生成 sourceMap
   */
  sourceMap: string | boolean;

  /**
   * 使用的插件
   */
  plugins: any[];

  /**
   * 是否为监听状态
   */
  watching: boolean;

  /**
   * 是否打包模块
   *
   * @description
   * 打包的模块根据 `libs(src)/bundler/*` 文件定义
   * 可以通过 `libs(src)/bundler` 中的 `Bundler.register` 注册
   */
  bundle: boolean;

  /**
   * 是否为安静模式
   */
  silence: boolean;

  /**
   * 微信小程序 project.config.json 文件配置
   */
  projectConfig: WXProjectConfig;

  /**
   * project.config.json 文件位置
   */
  projectConfigFile: string;

  /**
   * 小程序代码根目录
   */
  miniprogramRoot: string;

  /**
   * 小程序插件根目录
   */
  pluginRoot: string;

  /**
   * 微信小程序 app.config.json 文件配置
   */
  appConfig: any;

  /**
   * 微信小程序 app.config.json 文件
   */
  appConfigFile: string;
}
