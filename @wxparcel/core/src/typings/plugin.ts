import Assets from '../libs/Assets'
import { Option } from './option'

/**
 * 插件
 */
export interface Plugin {
  applyAsync?: (options: Option) => Promise<any>;
  applyBefore?: (options: Option) => Promise<any>;
  applyBeforeTransform?: (assets: Assets, options: Option) => Promise<any>;
}
