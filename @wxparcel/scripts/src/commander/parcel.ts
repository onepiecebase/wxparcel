import fs from 'fs-extra'
import * as path from 'path'
import chalk from 'chalk'
import pick from 'lodash/pick'
import program from 'commander'
import columnify from 'columnify'
import { Parcel, GlobalOptionManager, GlobalLogger, localRequire } from 'wxparcel-core'
import Project from '../constants/project'
import babelRequire from '../vendors/babel-register'
import * as Typings from '../typings'

const MESSAGE_PADDING = ' '.padStart(27)

program
  .command('start')
  .description('start the compilation process')
  .option('-c, --config <config>', 'setting configuration file')
  .option('-w, --watch', 'open the listener for file changes')
  .option('--publicPath <publicPath>', 'set public path of static resources')
  .option('--sourceMap <sourceMap>', 'generate sourceMap')
  .option(
    '--env <env>',
    `setting process.env.NODE_ENV variables` +
      `\n${MESSAGE_PADDING}${chalk.bold('dev|develop|development')} for development` +
      `\n${MESSAGE_PADDING}${chalk.bold('test|unitest|prerelease')} for test` +
      `\n${MESSAGE_PADDING}${chalk.bold('prod|product|production')} for production`
  )
  .option('--bundle <bundle>', 'generate bundlers with generated bundler')
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  .on('--help', helpAction)
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  .action(startAction)

// Help Action
function helpAction(): void {
  GlobalLogger.print('\nExamples:')
  GlobalLogger.print(`  $ wxparcel-script start --env development --watch`)
  GlobalLogger.print('  $ wxparcel-script start --env production --config wx.config.js')
}

// Start Action
async function startAction(options: Typings.ParcelCliOptions = {}): Promise<void> {
  try {
    const { env } = options
    switch (env) {
      case 'dev':
      case 'develop':
      case 'development': {
        process.env.NODE_ENV = 'development'
        break
      }

      case 'test':
      case 'unitest':
      case 'prerelease': {
        process.env.NODE_ENV = 'test'
        break
      }

      case 'prod':
      case 'product':
      case 'production':
      case 'release': {
        process.env.NODE_ENV = 'production'
        break
      }
    }

    let { config } = options
    if (config) {
      if (!path.isAbsolute(config)) {
        config = path.join(GlobalOptionManager.rootDir, config)
      }

      if (!fs.existsSync(config)) {
        throw new Error(`Config file is not found, please ensure config file exists. ${config}`)
      }
    }

    options.config = config
    options.watch = options.hasOwnProperty('watch')

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    await run(options)
  } catch (error) {
    GlobalLogger.error(error)
  }
}

// 执行编译流程
async function run(options: Typings.ParcelCliOptions = {}): Promise<void> {
  const { config: configFile, stats: statsMode } = options

  let parcelOptions: { [key: string]: any } = {}
  if (configFile) {
    if (!fs.existsSync(configFile)) {
      throw new Error(`Config file is not found, please ensure config file exists. ${configFile}`)
    }

    switch (path.extname(configFile)) {
      case '.js': {
        if (/\.babel\.js$/.test(configFile)) {
          parcelOptions = await babelRequire(configFile)
          break
        }

        parcelOptions = require(configFile)
        parcelOptions = parcelOptions.default || parcelOptions
        break
      }

      case '.ts': {
        break
      }
    }
  } else {
    // 如果没有配置, 则使用默认配置
    parcelOptions = await localRequire('wxparcel-config-normal', process.cwd(), true)
  }

  if (options.hasOwnProperty('publicPath')) {
    options.publicPath = options.publicPath
  }

  switch (statsMode) {
    case 'none': {
      parcelOptions.logLevel = 'none'
      break
    }

    case 'error': {
      parcelOptions.logLevel = 'error'
      break
    }

    case 'verbose': {
      parcelOptions.logLevel = 'verbose'
      break
    }
  }

  const proto = Object.getPrototypeOf(parcelOptions)
  const descriptors = Object.entries(Object.getOwnPropertyDescriptors(proto))
  const getters = descriptors.filter(([, descriptor]) => typeof descriptor.get === 'function').map(([key]) => key)
  const getterOptions = pick(parcelOptions, getters)

  parcelOptions = Object.assign({}, getterOptions, parcelOptions, options)
  await GlobalOptionManager.resolve(parcelOptions)

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  cleanConsole()

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  printInfo()

  GlobalLogger.print(chalk.cyan.bold('Compiling...'))

  const parcel = new Parcel(GlobalOptionManager)
  const stats = await parcel.run()
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  stats && printStats(stats)

  /**
   * 是否监听文件
   */
  if (options.watch) {
    GlobalOptionManager.watching = true

    const options = {
      change: (file: string, hasBeenEffect: any) =>
        GlobalLogger.print(`\nFile ${chalk.bold(file)} has been changed, ${hasBeenEffect ? 'compile' : "but it's not be required, ignore"}...\n`),
      unlink: (file: string) => GlobalLogger.print(`\nFile ${chalk.bold(file)} has been deleted, but it will be only delete from cache.\n`),
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      complete: (stats: Typings.ParcelStats) => printStats(stats),
    }

    parcel.watch(options)
  }
}

function printStats(stats: Typings.ParcelStats): void {
  switch (GlobalOptionManager.stats) {
    case 'verbose': {
      const maxWidth = 80

      const headingTransform = (heading: string) => {
        const name = heading.charAt(0).toUpperCase() + heading.slice(1)
        return chalk.white.bold(name)
      }

      const assetsDataTransform = (file: string) => {
        const { outDir, staticDir } = GlobalOptionManager
        file = file.replace(outDir + path.sep, '').replace(staticDir + path.sep, '')

        let dirname = path.dirname(file)
        const filename = path.basename(file)
        if (file.length > maxWidth) {
          const length = maxWidth - filename.length
          if (length > 0) {
            dirname = dirname.substr(0, length - 3) + '..'
          }
        }

        return chalk.green.bold(path.join(dirname, filename))
      }

      const formatBytes = (bytes: number, decimals = NaN) => {
        // tslint:disable-next-line:triple-equals
        if (bytes == 0) {
          return '0 Bytes'
        }

        const k = 1024
        const dm = decimals + 1 || 3
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
      }

      const sizeDataTransform = (size: string) => {
        return formatBytes(Number(size))
      }

      const options: columnify.GlobalOptions = {
        headingTransform: headingTransform,
        config: {
          assets: {
            maxWidth: maxWidth,
            align: 'right',
            dataTransform: assetsDataTransform,
          },
          size: {
            align: 'right',
            dataTransform: sizeDataTransform,
          },
        },
      }

      const message = columnify(stats, options)

      if (stats.spendTime) {
        GlobalLogger.print(message)
        GlobalLogger.print(`\n${chalk.gray('Spend Time:')} ${chalk.white.bold(stats.spendTime + '')}ms\n`)
      }

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      printInfo()
      break
    }

    default: {
      GlobalLogger.print(`✨ ${chalk.cyan.bold('Compiled has been done.')}`)
      break
    }
  }
}

function printInfo(): void {
  const { srcDir, watching, pubPath } = GlobalOptionManager
  GlobalLogger.print(`Version: ${chalk.cyan.bold(Project.version)}`)
  GlobalLogger.print(`StaticServ: ${chalk.cyan.bold(pubPath)}`)
  GlobalLogger.print(
    `Open your ${chalk.cyan.bold('WeChat Develop Tool')} to serve. Download in ${chalk.white.bold('https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html')}`
  )
  watching && GlobalLogger.print(`Watching folder ${chalk.white.bold(srcDir)}, cancel at ${chalk.white.bold('Ctrl + C')}`)
}

function cleanConsole(): void {
  GlobalLogger.clear()
}
