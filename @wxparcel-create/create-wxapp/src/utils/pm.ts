import fs from 'fs-extra'
import * as path from 'path'
import { promisify } from 'util'
import commandExists from 'command-exists'
import { spawn } from './process'
import { cwdPath } from '../constants/conf'
import * as Typings from '../typings'

export interface InstallOptions {
  packageManager?: Typings.PackageManager
}

/**
 * 判断是否支持 Yarn 命令
 * @returns 是否支持
 */
export async function detectSupportYarn(): Promise<boolean> {
  const support = await promisify(commandExists.bind(null))('yarn')
  return support ? true : false
}

export function getTarballName(dependency: string): string {
  if (dependency.charAt(0) === '@') {
    return dependency.replace(/^@(\w+?)\//, '$1-')
  }

  return dependency
}

/**
 * 获取 NPM tar.gz 包
 */
export async function getTarball(dependency: string, cwd: string = cwdPath): Promise<string> {
  fs.ensureDirSync(cwd)

  await spawn('npm', ['pack', dependency], { stdio: 'inherit', cwd })

  const tarball = getTarballName(dependency)
  const files = fs.readdirSync(cwd)
  const project = files.find((filename: string) => new RegExp(`^${tarball}`, 'i').test(filename))
  if (!project) {
    throw new Error(`该模板不存在${project}`)
  }

  const file = path.join(cwd, project)
  return file
}

export async function installDepedences(cwd: string = cwdPath, options: InstallOptions = {}): Promise<void> {
  let { packageManager: pm } = options
  if (!pm) {
    pm = (await detectSupportYarn()) ? 'yarn' : 'npm'
  }

  const isYarn = pm === 'yarn'
  const installCommand = isYarn ? '' : 'install'
  console.log(pm, installCommand)

  await spawn(pm, [installCommand], { stdio: 'inherit', cwd })
}
