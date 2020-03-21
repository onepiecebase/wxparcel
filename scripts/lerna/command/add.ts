import flattenDeep from 'lodash/flattenDeep'
import { program } from 'commander'
import inquirer from 'inquirer'
import { select, spawn } from '../share/pm'
import { rootPath } from '../constants/conf'

export async function add(dependencies: string[], isDev?: Boolean): Promise<void> {
  if (!(Array.isArray(dependencies) && dependencies.length > 0)) {
    const prompt = inquirer.createPromptModule()
    const questions = [
      {
        name: 'dependencies',
        type: 'input',
        message: '请选择需需要添加依赖的模块',
      },
    ]

    const { dependencies } = await prompt(questions)
    return add(dependencies.split(' '), isDev)
  }

  const { packages } = await select('请选择需要添加依赖的模块')
  if (!(Array.isArray(packages) && packages.length > 0)) {
    return
  }

  const [command] = dependencies
  const scopes = packages.map(name => ['--scope', name])
  const scopeParams = command.split(' ').concat(flattenDeep(scopes))
  const params = ['add', isDev ? '--dev' : '', ...scopeParams].filter(Boolean)
  await spawn('lerna', params, { cwd: rootPath, stdio: 'inherit' })
}

program
.command('add [dependencies...]')
.option('--dev, --save-dev <isDev>')
.action((dependencies, options) => add(dependencies, options.isDev))
