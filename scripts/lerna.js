const fs = require('fs-extra')
const path = require('path')
const { spawn: cpSpawn } = require('child_process')
const glob = require('glob')
const inquirer = require('inquirer')
const fromPairs = require('lodash/fromPairs')
const flattenDeep = require('lodash/flattenDeep')
const { packages: lernaPackagePatterns } = require('../lerna.json')
const root = path.join(__dirname, '..')

function getCommands() {
  return process.argv.slice(2)
}

async function select() {
  const promises = lernaPackagePatterns.map(pattern => {
    return new Promise((resolve, reject) => {
      glob(pattern, { cwd: root }, (error, matches) => {
        error ? reject(error) : resolve(matches)
      })
    })
  })

  const files = await Promise.all(promises).then((...files) => flattenDeep(files))
  const folders = files.filter(file => fs.statSync(file).isDirectory() && fs.existsSync(path.join(file, 'package.json')))
  const packages = folders.map(folder => {
    const file = path.join(folder, 'package.json')
    const { name } = fs.readJsonSync(file)
    return [name, folder]
  })

  const packageMap = fromPairs(packages)
  const prompt = inquirer.createPromptModule()
  const questions = [
    {
      name: 'packages',
      type: 'checkbox',
      message: '请选择需要开发的模块, 注意监听的模块不能有依赖.',
      choices: Object.keys(packageMap),
    },
  ]

  return prompt(questions)
}

function spawn(cli, params = [], options = {}, stdout) {
  return new Promise((resolve, reject) => {
    let cp = cpSpawn(cli, params || [], options || {})

    if (typeof stdout === 'function') {
      cp.stdout.on('data', data => stdout(data, 'out'))
      cp.stderr.on('data', data => stdout(data, 'err'))
    }

    let handleProcessSigint = process.exit.bind(process)
    let handleProcessExit = () => {
      cp && cp.kill('SIGINT')
      process.removeListener('exit', handleProcessExit)
      process.removeListener('SIGINT', handleProcessSigint)

      cp = undefined
      handleProcessExit = undefined
      handleProcessSigint = undefined
    }

    cp.on('exit', code => resolve(code))
    cp.on('SIGINT', () => reject(new Error('Process has been killed')))

    process.on('exit', handleProcessExit)
    process.on('SIGINT', handleProcessSigint)
  })
}

async function exec() {
  const commands = getCommands()
  if (!(Array.isArray(commands) && commands.length > 0)) {
    return
  }

  const { packages } = await select()
  if (!(Array.isArray(packages) && packages.length > 0)) {
    return
  }

  const [command] = commands
  const scopes = packages.map(name => ['--scope', name])
  const params = command.split(' ').concat(flattenDeep(scopes))
  return await spawn('lerna', ['exec', ...params], { cwd: root, stdio: 'inherit' })
}

exec()
