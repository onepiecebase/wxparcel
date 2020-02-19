import fs from 'fs-extra'
import * as path from 'path'
import chalk from 'chalk'
import pick from 'lodash/pick'
import program from 'commander'
import columnify from 'columnify'
import { Parcel, GlobalOptionManager, GlobalLogger } from 'wxparcel-core'
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
  .on('--help', helpAction)
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
    let { config, env } = options

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

    if (!config) {
      config = path.join(__dirname, '../constants/config.js')
    }

    if (!path.isAbsolute(config)) {
      config = path.join(GlobalOptionManager.rootDir, config)
    }

    if (!fs.existsSync(config)) {
      throw new Error(`Config file is not found, please ensure config file exists. ${config}`)
    }

    options.config = config
    options.watch = options.hasOwnProperty('watch')

    await run(options)
  } catch (error) {
    GlobalLogger.error(error)
  }
}

// 执行编译流程
async function run(options: Typings.ParcelCliOptions = {}): Promise<void> {
  let { config: configFile, stats: statsMode } = options
  if (!configFile) {
    throw new TypeError('Config file is not provided')
  }

  if (!fs.existsSync(configFile)) {
    throw new Error(`Config file is not found, please ensure config file exists. ${configFile}`)
  }

  let parcelOptions: { [key: string]: any } = {}
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

  let proto = Object.getPrototypeOf(parcelOptions)
  let descriptors = Object.entries(Object.getOwnPropertyDescriptors(proto))
  let getters = descriptors.filter(([_key, descriptor]) => typeof descriptor.get === 'function').map(([key]) => key)
  let getterOptions = pick(parcelOptions, getters)

  parcelOptions = Object.assign({}, getterOptions, parcelOptions, options)
  await GlobalOptionManager.resolve(parcelOptions)

  // cleanConsole()
  printInfo()

  GlobalLogger.print(chalk.cyan.bold('Compiling...'))

  let parcel = new Parcel(GlobalOptionManager)
  let stats = await parcel.run()
  stats && printStats(stats)

  /**
   * 是否监听文件
   */
  if (options.watch) {
    GlobalOptionManager.watching = true

    let options = {
      change: (file: string, hasBeenEffect: any) =>
        GlobalLogger.print(`\nFile ${chalk.bold(file)} has been changed, ${hasBeenEffect ? 'compile' : "but it's not be required, ignore"}...\n`),
      unlink: (file: string) => GlobalLogger.print(`\nFile ${chalk.bold(file)} has been deleted, but it will be only delete from cache.\n`),
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
        let name = heading.charAt(0).toUpperCase() + heading.slice(1)
        return chalk.white.bold(name)
      }

      const assetsDataTransform = (file: string) => {
        let { outDir, staticDir } = GlobalOptionManager
        file = file.replace(outDir + path.sep, '').replace(staticDir + path.sep, '')

        let dirname = path.dirname(file)
        let filename = path.basename(file)
        if (file.length > maxWidth) {
          let length = maxWidth - filename.length
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

        let k = 1024
        let dm = decimals + 1 || 3
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        let i = Math.floor(Math.log(bytes) / Math.log(k))

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
