import fs from 'fs-extra'
import * as path from 'path'
import { GlobalOptionManager, localRequire, resolve } from 'wxparcel-core'

let babelRegisterModule: any = null

export default async function babelRequire(babelFile: string) {
  let babelrc = path.join(GlobalOptionManager.rootDir, './.babelrc')
  if (fs.existsSync(babelrc)) {
    let register = await tryRequireBabelRegister()
    let babelConfig = fs.readJSONSync(babelrc)
    register(babelConfig || {})
  }

  const module = require(babelFile)
  return module.default || module
}

async function tryRequireBabelRegister(): Promise<any> {
  if (babelRegisterModule) {
    return babelRegisterModule
  }

  try {
    let path = resolve('@babel/register')
    babelRegisterModule = require(path)
    babelRegisterModule = babelRegisterModule.default || babelRegisterModule
  } catch (error) {
    try {
      let path = resolve('babel-register')
      babelRegisterModule = require(path)
      babelRegisterModule = babelRegisterModule.default || babelRegisterModule
    } catch (error) {
      babelRegisterModule = await localRequire('@babel/register', GlobalOptionManager.rootDir, true)
    }
  }

  return babelRegisterModule
}
