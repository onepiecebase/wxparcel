import { Option } from './option'
import { RuleOption } from './rule'
import { ChunkState, ChunkDependency } from './chunk'

export interface LoaderOption extends Option {
  file: string;
  rule: RuleOption;
  options: object;
}

export interface LoaderResult {
  code: string | Buffer;
  map?: string | object;
  dependencies?: ChunkDependency[] | string[];
}

/**
 * 加载器
 */
export type Loader = (state: ChunkState, options: LoaderOption) => Promise<LoaderResult>
