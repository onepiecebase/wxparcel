import flattenDeep from 'lodash/flattenDeep'
import { program } from 'commander'
import { select, spawn } from '../share/pm'
import { rootPath } from '../constants/conf'

export async function exec(commands: string[]): Promise<void> {
  if (!(Array.isArray(commands) && commands.length > 0)) {
    return
  }

  const { packages } = await select('请选择需要开发的模块, 注意监听的模块不能有依赖.')
  if (!(Array.isArray(packages) && packages.length > 0)) {
    return
  }

  const [command] = commands
  const scopes = packages.map(name => ['--scope', name])
  const scopeParams = command.split(' ').concat(flattenDeep(scopes))
  const params = ['exec', ...scopeParams]
  await spawn('lerna', params, { cwd: rootPath, stdio: 'inherit' })
}

program
.command('exec [commands...]')
.action((commands) => exec(commands))
