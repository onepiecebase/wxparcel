import { ServeStaticOptions } from 'serve-static'

export interface DevServerOptions extends ServeStaticOptions {
  /**
   * 端口
   */
  port?: number;
}
