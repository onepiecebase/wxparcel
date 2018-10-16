import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import program from 'commander'
import columnify from 'columnify'
import OptionManager from '../option-manager'
import Logger from '../logger'
import Parcel from '../parcel'
import { version as pkgVersion } from '../../package.json'

/**
 * 执行编译流程
 *
 * @param {Object} [options={}] 配置
 * @param {String} options.config 配置文件
 */
const run = async (options = {}) => {
  let { config: configFile } = options

  if (!configFile) {
    throw new TypeError('Config file is not provided')
  }

  if (!fs.existsSync(configFile)) {
    throw new Error(`Config file is not found, please ensure config file exists. ${configFile}`)
  }

  let babelrc = path.join(OptionManager.execDir, './.babelrc')
  if (fs.existsSync(babelrc)) {
    let babelConfig = fs.readJSONSync(babelrc)
    require('babel-register')(babelConfig || {})
  }

  let parcelOptions = require(configFile)
  parcelOptions = parcelOptions.default || parcelOptions

  if (options.hasOwnProperty('publicPath')) {
    parcelOptions.publicPath = options.publicPath
  }

  Object.assign(parcelOptions, options)
  await OptionManager.resolve(parcelOptions)

  cleanConsole()
  printInfor()

  let parcel = new Parcel()
  let stats = await parcel.run()
  printStats(stats)

  /**
   * 是否监听文件
   */
  if (options.watch) {
    OptionManager.watching = true
    parcel.watch((stats) => printStats(stats))
  }
}

/**
 * Start Action
 *
 * @param {Object} [options={}] 配置
 * @param {String} options.config 配置文件
 */
const startAction = async (options = {}) => {
  try {
    let { config, env } = options

    switch (env) {
      case 'prod':
      case 'product':
      case 'production': {
        process.env.NODE_ENV = 'production'
        break
      }

      case 'test':
      case 'unitest':
      case 'prerelease': {
        process.env.NODE_ENV = 'prerelease'
        break
      }

      case 'dev':
      case 'develop':
      case 'development':
      default: {
        process.env.NODE_ENV = 'development'
        break
      }
    }

    if (!config) {
      config = path.join(__dirname, '../constants/config.js')
    }

    if (!path.isAbsolute(config)) {
      config = path.join(OptionManager.rootDir, config)
    }

    if (!fs.existsSync(config)) {
      throw new Error(`Config file is not found, please ensure config file exists. ${config}`)
    }

    options.config = config
    options.watch = options.hasOwnProperty('watch')

    await run(options)
  } catch (error) {
    Logger.error(error)
  }
}

/**
 * Help Action
 */
const helpAction = () => {
  Logger.trace('\nExamples:')
  Logger.trace('  $ wxparcel-script start --env development --watch')
  Logger.trace('  $ wxparcel-script start --env production --config wx.config.js')
}

program
  .command('start')
  .description('start the compilation process')
  .option('-c, --config <config>', 'setting configuration file')
  .option('--env <env>')
  .option('-w, --watch', 'open the listener for file changes')
  .option('--publicPath <publicPath>', 'set public path of static resources')
  .on('--help', helpAction)
  .action(startAction)

function cleanConsole () {
  Logger.clear()
}

function printInfor () {
  const { srcDir, watching } = OptionManager
  Logger.trace(`Version: ${chalk.cyan.bold(pkgVersion)}`)
  Logger.trace(`Open your ${chalk.cyan.bold('WeChat Develop Tool')} to serve. Download in ${chalk.white.bold('https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html')}`)
  watching && Logger.trace(`Watching folder ${chalk.white.bold(srcDir)}, cancel at ${chalk.white.bold('Ctrl + C')}`)
}

function printStats (stats) {
  const maxWidth = 80

  const headingTransform = (heading) => {
    let name = heading.charAt(0).toUpperCase() + heading.slice(1)
    return chalk.white.bold(name)
  }

  const assetsDataTransform = (file) => {
    let { outDir, staticDir } = OptionManager
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

  const formatBytes = (bytes, decimals) => {
    // eslint-disable-next-line eqeqeq
    if (bytes == 0) {
      return '0 Bytes'
    }

    let k = 1024
    let dm = decimals + 1 || 3
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  const sizeDataTransform = (size) => {
    return formatBytes(size)
  }

  const options = {
    headingTransform: headingTransform,
    config: {
      assets: {
        maxWidth: maxWidth,
        align: 'right',
        dataTransform: assetsDataTransform
      },
      size: {
        align: 'right',
        dataTransform: sizeDataTransform
      }
    }
  }

  const message = columnify(stats, options)
  Logger.trace(message)
  Logger.trace(`\n${chalk.gray('Spend Time:')} ${chalk.white.bold(stats.spendTime)}ms\n`)

  printInfor()
}
