import * as path from 'path'
import Module from 'module'
import { pipeInstallDependencies } from './pm'

const cwdPath = process.cwd()
const modulesPaths = {}
const modules = {}

/**
 * 获取真正的模块名称
 * @param moduleName 模块名
 */
export const resolveTruthModuleName = (moduleName: string): string => {
  const paths = moduleName.split('/')
  if (paths[0].charAt(0) === '@') {
    return paths.splice(0, 2).join('/')
  }

  return paths.splice(0, 1).join('/')
}

/**
 * 模块转换
 * @description 根据 NodeJS 的查找方式往上查找依赖, 直到根目录为止
 * @param findedPath 起始的查找路径
 * @returns 匹配到的路径
 */
export const resolvePaths = (findedPath: string = cwdPath): any => {
  const rootPath = findedPath ? path.resolve(findedPath) : process.cwd()
  const rootName = path.join(rootPath, '@root')
  let root = modulesPaths[rootName]

  if (!root) {
    root = new Module(rootName)
    root.filename = rootName
    root.paths = (Module as any)._nodeModulePaths(rootPath)
    modulesPaths[rootName] = root
  }

  return root
}

/**
 * 查找模块路径
 * @param moduleName 模块名称
 * @param findedPath 起始的查找路径
 */
export const resolve = (moduleName: string, findedPath: string = cwdPath): string => {
  const root = resolvePaths(findedPath)
  return (Module as any)._resolveFilename(moduleName, root)
}

/**
 * 解析本地依赖
 * @param moduleName 模块名称
 * @param findedPath 起始的查找路径
 * @param triedInstall 尝试安装
 */
export const localResolve = async <T extends string | string[]>(moduleNames: T, findPath: string = cwdPath, triedInstall: boolean = false): Promise<T> => {
  const isSingle = !Array.isArray(moduleNames)
  const names = isSingle ? [moduleNames] : [].concat(moduleNames)

  let modules = []
  const invalids = []

  names.forEach(name => {
    try {
      const path = require.resolve(name)
      modules.push(path)
    } catch (error) {
      try {
        const path = resolve(name, findPath)
        modules.push(path)
      } catch (error) {
        invalids.push(name)
      }
    }
  })

  if (invalids.length > 0) {
    if (triedInstall === true) {
      const dependencies = invalids.map(name => resolveTruthModuleName(name))
      await pipeInstallDependencies(dependencies, findPath)

      const installedModules = await localResolve(moduleNames, findPath, true)
      modules = modules.concat(installedModules)
      return isSingle ? modules[0] : modules
    }

    throw new Error(`Cannot found modules ${invalids.join(',')}`)
  }

  return isSingle ? modules[0] : modules
}

/**
 * 加载本地依赖
 * @param moduleName 模块名称
 * @param findedPath 起始的查找路径
 * @param triedInstall 尝试安装
 */
export const localRequire = async (moduleName: string | string[], findPath: string = cwdPath, triedInstall: boolean = false): Promise<any> => {
  if (Array.isArray(moduleName)) {
    const resolves = await localResolve(moduleName, findPath, triedInstall)
    return resolves.map((resolved, index) => {
      const name = moduleName[index]
      let module = modules[name]

      if (!module) {
        module = require(resolved)
        modules[resolved] = module
      }

      return module
    })
  }

  let module = modules[moduleName]
  if (!module) {
    const resolved = await localResolve(moduleName, findPath, triedInstall)
    module = require(resolved)
    modules[resolved] = module
  }

  return module
}
