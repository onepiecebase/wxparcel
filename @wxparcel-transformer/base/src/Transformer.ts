import path from 'path'
import glob from 'glob'
import { waterfall } from 'async'
import minimatch from 'minimatch'
import { OptionManager } from 'wxparcel-core'
import * as Typings from './typings'

export default class Transformer {
  protected file: string
  protected source: Buffer
  protected options: OptionManager

  constructor(params: Typings.TransformerParams, options?: OptionManager) {
    this.file = params.file
    this.source = params.source

    if (typeof options !== 'undefined') {
      this.options = options
    }
  }

  /**
   * 解析
   */
  public async transform (): Promise<Typings.TransformerResult> {
    const code = this.source
    const map = null
    const ast = null
    const dependencies = []
    return { code, map, ast, dependencies }
  }

  /**
   * 查找别名集合
   * @param pattern 匹配字符串 (参考 minimatch.js)
   * @param alias 别名集合
   * @returns 匹配到的别名集合
   */
  public matchAlias (pattern: string, alias: Typings.Alias): string[] {
    const key = Object.keys(alias).find((name: string) => minimatch(pattern, name))
    return key ? alias[key] : []
  }

  /**
   * 查找文件
   * @param filename 文件名 (带后缀)
   * @param pattern 正则匹配
   * @returns 文件路径 (匹配不到返回 undefined)
   */
  public async findFile (filename: string, pattern: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const abs = path.join(process.cwd(), pattern)
      glob(abs, (error, files) => {
        if (error) {
          reject(error)
          return
        }

        for (let i = files.length; i --;) {
          const file = files[i]
          if (path.basename(file) === path.basename(filename)) {
            resolve(file)
            return
          }
        }

        resolve()
      })
    })
  }

  /**
   * 根据别名路径查找文件
   * @param filename 文件名 (带后缀)
   * @param alias 别名路径集合
   * @returns 文件路径 (匹配不到返回 undefined)
   */
  public async findFileByAlias (filename: string, alias: Typings.Alias): Promise<string> {
    return new Promise((resolve, reject) => {
      const patterns = this.matchAlias(filename, alias)
      const tasks = patterns.map((pattern) => async (callback: (error: Error | true, result?: any) => void) => {
        try {
          const file = await this.findFile(filename, pattern)
          const breakFlag = typeof file === 'string' ? true : null
          callback(breakFlag, file)

        } catch (error) {
          callback(error)
        }
      })
      
      return waterfall(tasks, (error: Error | true, result: string) => {
        if (error instanceof Error) {
          reject(error)
          return
        }

        resolve(result)
      })
    })
  }
}
