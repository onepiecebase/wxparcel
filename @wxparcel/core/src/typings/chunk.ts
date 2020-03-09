import Chunk from '../libs/Chunk'
import { RuleOption } from './rule'
import { ValueOf } from './utils'

export type ChunkTypes = 'bundle' | 'bundler' | 'scatter' | 'entry'

export interface ChunkState {
  /**
   * 文件名
   */
  file?: string;

  /**
   * 分片类型
   */
  type?: ValueOf<ChunkTypes>;

  /**
   * 依赖集合
   */
  dependencies?: ChunkDependency[] | string[];

  /**
   * 内容
   */
  content?: Buffer | string;

  /**
   * 代码映射表 SourceMap
   */
  sourceMap?: string | { [key: string]: any };

  /**
   * 加载规则
   */
  rule?: RuleOption;

  /**
   * 保存的目的地路径
   */
  destination?: string | string[];
}

export interface ChunkUpdateProps extends Omit<Partial<Chunk>, 'dependencies'> {
  dependencies?: ChunkDependency[] | string[];
}

export interface ChunkDependency {
  file?: string;
  dependency: string;
  destination?: string;
  required?: string;
  type?: ValueOf<ChunkTypes>;
}
