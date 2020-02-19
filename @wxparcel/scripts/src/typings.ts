/**
 * CLI 配置
 */
export interface ParcelCliOptions {
  /**
   * 配置文件
   */
  config?: string;

  /**
   * 监听
   */
  watch?: boolean;

  /**
   * 日志输出类型
   */
  stats?: 'none' | 'error' | 'verbose';

  /**
   * 静态路径
   */
  publicPath?: string;

  /**
   * 开启 sourceMap 与类型
   */
  sourceMap?: boolean | string;

  /**
   * 环境
   */
  env?: string;

  /**
   * 是否打包(默认: 否)
   */
  bundle?: boolean | string;
}

/**
 * 输出结果信息
 */
export interface ParcelStats extends Array<{ assets: string[]; size: number }> {
  spendTime?: number;
}
