import fs from 'fs-extra'
import * as path from 'path'
import GlobalOptionManager from '../../services/option-manager'
import { localRequire, resolve } from '../../share/module'

let babelRegisterModule: any = null

export default async function babelRequire(babelFile: string) {
  const babelrc = path.join(GlobalOptionManager.rootDir, './.babelrc')
  if (fs.existsSync(babelrc)) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const register = await tryRequireBabelRegister()
    const babelConfig = fs.readJSONSync(babelrc)
    register(babelConfig || {})
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const module = require(babelFile)
  return module.default || module
}

const tryRequireBabelRegister = async (): Promise<any> => {
  if (babelRegisterModule) {
    return babelRegisterModule
  }

  try {
    const path = resolve('@babel/register')
    babelRegisterModule = require(path)
    babelRegisterModule = babelRegisterModule.default || babelRegisterModule
  } catch (error) {
    try {
      const path = resolve('babel-register')
      babelRegisterModule = require(path)
      babelRegisterModule = babelRegisterModule.default || babelRegisterModule
    } catch (error) {
      babelRegisterModule = await localRequire('@babel/register', GlobalOptionManager.rootDir, true)
    }
  }

  return babelRegisterModule
}
