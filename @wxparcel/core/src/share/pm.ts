import fs from 'fs-extra'
import * as path from 'path'
import { promisify } from 'util'
import commandExists from 'command-exists'
import Queue from '../libs/Queue'
import GlobalLogger from '../services/logger'
import { pipeSpawn } from './process'
import * as Typings from '../typings'

const cwdPath = process.cwd()
const installedModules: string[] = []
const pmQueue = new Queue()

/**
 * 安装依赖
 * @param modules 模块名称
 * @param execPath 执行路径
 * @param options 配置
 */
export const installDependencies = async (modules: string[] | string, execPath: string = cwdPath, options: Typings.PMInstallOptions = {}): Promise<any> => {
  const { installPeers = true, saveDev = true } = options
  let { packageManager } = options

  if (typeof modules === 'string') {
    modules = [modules]
  }

  modules = modules.filter(item => -1 === installedModules.indexOf(item))
  if (modules.length === 0) {
    return
  }

  if (!packageManager) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    packageManager = await determinePackageManager()
  }

  const isYarn = packageManager === 'yarn'
  const installCommand = isYarn ? 'add' : 'install'
  const args = [installCommand, ...modules]
  if (saveDev === true) {
    isYarn ? args.push('--dev') : args.push('--save-dev')
  }

  const packageFile = path.join(execPath, 'package.json')
  if (packageManager === 'npm' && !fs.existsSync(packageFile)) {
    await fs.writeFile(packageFile, '{}')
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const linkedModules = await fetchNpmLinks(execPath)
  try {
    GlobalLogger.print(`Try install ${modules.join(', ')}, please wait...`)
    await pipeSpawn(packageManager, args, { stdio: 'inherit' })

    GlobalLogger.print(`Install ${modules.join(', ')} completed`)
    installedModules.splice(installedModules.length, 0, ...modules)

    const promises = linkedModules.map(({ file, real }) => (!fs.existsSync(file) ? fs.symlink(real, file) : Promise.resolve()))
    await Promise.all(promises)
  } catch (error) {
    setTimeout(() => process.exit(0))
    throw new Error(`Failed to install ${modules.join(', ')}\n${error.message}`)
  }

  if (installPeers === true) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    await Promise.all(modules.map(name => installPeerDependencies(name, execPath, options)))
  }
}

/**
 * 安装 peer 依赖
 * @param name 模块名称
 * @param execPath 执行路径
 * @param options 配置
 */
export const installPeerDependencies = async (name: string, execPath: string, options: Typings.PMInstallOptions = {}) => {
  const modulePath = path.resolve(path.join('node_modules', name))
  const packageFile = path.join(modulePath, 'package.json')
  const pkg = await fs.readJsonSync(packageFile)
  const peers = pkg.peerDependencies || {}

  const modules = []
  for (const peer in peers) {
    modules.push(`${peer}@${peers[peer]}`)
  }

  if (modules.length > 0) {
    const settings: Typings.PMInstallOptions = Object.assign({}, options, { installPeers: false })
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    await installDependencies(modules, execPath, settings)
  }
}

/**
 * 确定包管理器
 * @param rootPath 执行路径
 * @returns npm 或 yarn
 */
export const determinePackageManager = async (rootPath: string = cwdPath): Promise<string> => {
  const lockFile = path.join(rootPath, 'yarn.lock')
  if (fs.existsSync(lockFile)) {
    return 'yarn'
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const hasYarn = await detectSupportYarn()
  return hasYarn ? 'yarn' : 'npm'
}

/**
 * 判断是否支持 Yarn 命令
 * @returns 是否支持
 */
export const detectSupportYarn = async (): Promise<boolean> => {
  const support = await promisify(commandExists.bind(null))('yarn')
  return support ? true : false
}

/**
 * 获取所有 npm links
 * @param rootPath 执行路径
 * @returns 文件名集合
 */
export const fetchNpmLinks = async (rootPath: string = cwdPath): Promise<Array<{ file: string, real: string }>> => {
  const links = []

  const nodeModules = path.join(rootPath, './node_modules')
  if (!fs.existsSync(nodeModules)) {
    return []
  }

  const files = await fs.readdir(nodeModules)
  files.forEach(filename => {
    const file = path.join(nodeModules, filename)
    const real = fs.realpathSync(file)
    real !== file && links.push({ file, real })
  })

  return links
}

export const pipeInstallDependencies: typeof installDependencies = pmQueue.pipefy(installDependencies)
