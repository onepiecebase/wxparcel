import { LoaderOption, LoaderResult } from './loader'
import { ChunkTypes } from './chunk'
import { ValueOf } from './utils'

export interface RuleOptionLoader {
  /**
   * 加载器路径
   */
  use: (asset: any, options: LoaderOption) => Promise<LoaderResult>;

  /**
   * 标记 Chunk 类型
   */
  for?: ValueOf<ChunkTypes>[] | ValueOf<ChunkTypes>;

  /**
   * 配置
   */
  options?: any;
}

/**
 * 编译规则配置
 */
export interface RuleOption {
  /**
   * 匹配方式
   */
  test: RegExp;

  /**
   * 排除
   */
  exclude?: Array<RegExp | string>;

  /**
   * 加载器
   */
  loaders: RuleOptionLoader[];

  /**
   * 后缀名
   */
  extname?: string;

  /**
   * 存储类型
   */
  type?: 'static';
}
