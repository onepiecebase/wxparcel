/**
 * 微信小程序项目配置
 */
export interface WXProjectConfig {
  /**
   * 小程序根路径
   */
  miniprogramRoot?: string;

  /**
   * 小程序插件根路径
   */
  pluginRoot?: string;
  [key: string]: any;
}

/**
 * 微信小程序页面配置
 */
export interface WXPageConfig {
  pages?: string[];
  usingComponents?: {
    [key: string]: string;
  };
  subpackages?: Array<{
    root?: string;
    pages?: string[];
  }>;
  subPackages?: Array<{
    root?: string;
    pages?: string[];
  }>;
}

/**
 * 微信小程序插件配置
 */
export interface WXPluginConfig {
  publicComponents?: {
    [key: string]: string;
  };
}
