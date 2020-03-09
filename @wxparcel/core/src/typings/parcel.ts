import { RuleOption } from './rule'
import { Plugin } from './plugin'

/**
 * 输出结果信息
 */
export interface ParcelStats extends Array<{ assets: string[]; size: number }> {
  spendTime?: number;
}

/**
 * 配置项
 */
export interface ParcelOptions {
  /**
   * 原文件存放目录, 相对根目录
   */
  src?: string;

  /**
   * 输出文件存放目录, 相对根目录
   */
  output?: string;

  /**
   * 静态文件存放目录, 相对根目录
   */
  static?: string;

  /**
   * 临时文件存放目录, 相对根目录
   */
  tmpl?: string;

  /**
   * 日志输出类型
   */
  stats?: 'none' | 'error' | 'verbose';

  /**
   * 公共服务路径, 相对根目录
   */
  publicPath?: string;

  /**
   * node_module 存放目录, 相对根目录
   * @description 因为小程序 node_module 被限制上传, 因此这里需要更换存放文件夹
   */
  nodeModuleDirectoryName?: string;

  /**
   * 日志类型
   */
  logType?: Array<'console' | 'file'> | 'console' | 'file';

  /**
   * 日志级别
   */
  logLevel?: 'none' | 'error' | 'warning' | 'verbose';

  /**
   * 规则集合
   */
  rules?: RuleOption[];

  /**
   * 是否生成 sourceMap
   */
  sourceMap?: string | boolean;

  /**
   * 使用的插件
   */
  plugins?: Plugin[];

  /**
   * 监听文件改动
   */
  watch?: boolean;

  /**
   * 是否打包模块
   *
   * @description
   * 打包的模块根据 `libs(src)/bundler/*` 文件定义
   * 可以通过 `libs(src)/bundler` 中的 `Bundler.register` 注册
   */
  bundle?: boolean;

  /**
   * 是否为安静模式
   */
  silence?: boolean;
}

/**
 * 检查配置
 */
export interface ParcelWatchOptions {
  /**
   * 监听文件改动
   * @param file 文件
   * @param hasBeenEffect 是否有影响
   */
  change?: (file: string, hasBeenEffect: boolean) => any;

  /**
   * 监听文件删除
   * @param file 文件
   * @param hasBeenEffect 是否有影响
   */
  unlink?: (file: string, hasBeenEffect: boolean) => any;

  /**
   * 每一次完成回调
   */
  complete?: (stats: Array<{ assets: string[]; size: number }>) => any;
}
