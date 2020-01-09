import chalk from 'chalk'
import PrettyError from 'pretty-error'
import OptionManager from './OptionManager'
import { LEVEL } from '../constants/log-levels'

/**
 * 日志管理器
 */
export default class Logger {
  /**
   * 日志类型
   */
  public type: Array<'console' | 'file'> | 'console' | 'file'

  /**
   * 级别
   */
  public level: 'none' | 'error' | 'warning' | 'verbose'

  /**
   * 是否为安静模式
   */
  public silence: boolean

  /**
   * 是否使用控制台输出
   * @readonly
   */
  get useConsole (): boolean {
    let type = this.type
    return type === 'console' || (Array.isArray(type) && type.indexOf('console') !== -1)
  }

  constructor (options: OptionManager) {
    this.type = options.logType || 'console'
    this.level = options.logLevel || 'error'
    this.silence = process.argv.findIndex((argv) => argv === '--quiet' || argv === '--silence') !== -1
  }

  /**
   * 记录错误信息
   * @param reason 信息
   */
  public error (reason: Error | TypeErrorConstructor | string): void {
    const levelKey = this.level.toUpperCase()
    const levelValue = LEVEL[levelKey]
    if (levelValue > LEVEL.ERROR) {
      return
    }

    if (this.useConsole === true && this.silence !== true) {
      if (reason instanceof Error || reason instanceof TypeError) {
        let pe = new PrettyError()
        reason.message = chalk.red(reason.message)

        let message = pe.render(reason)
        this.log(message)

      } else if (typeof reason === 'string') {
        reason = chalk.red(reason)
        this.log(reason)
      }
    }
  }

  /**
   * 记录警告信息
   * @param reason 信息
   */
  public warn (reason: Error | TypeErrorConstructor | string): void {
    const levelKey = this.level.toUpperCase()
    const levelValue = LEVEL[levelKey]
    if (levelValue > LEVEL.WARNING) {
      return
    }

    if (this.useConsole === true && this.silence !== true) {
      if (reason instanceof Error || reason instanceof TypeError) {
        let pe = new PrettyError()
        reason.message = chalk.yellow(reason.message)

        let message = pe.render(reason)
        this.log(message)

      } else if (typeof reason === 'string') {
        reason = chalk.red(reason)
        this.log(reason)
      }
    }
  }

  /**
   * 记录信息
   * @param message 信息
   */
  public log (message: string): void {
    const levelKey = this.level.toUpperCase()
    const levelValue = LEVEL[levelKey]
    if (levelValue > LEVEL.VERBOSE) {
      return
    }

    if (this.useConsole === true && this.silence !== true) {
      console.log(message)
    }
  }

  /**
   * 输出信息
   * @param ...message 信息
   */
  public print (message: string): void {
    console.log(message)
  }

  /**
   * 清除控制台
   * @param isSoft 信息
   */
  public clear (isSoft: boolean = true): void {
    process.stdout.write(isSoft ? '\x1B[H\x1B[2J' : '\x1B[2J\x1B[3J\x1B[H\x1Bc')
  }

  /**
   * 销毁对象
   */
  public destory (): void {
    this.type = undefined
    this.silence = undefined
    this.destory = Function.prototype as any
  }
}
