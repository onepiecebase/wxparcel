import fs from 'fs-extra'
import path from 'path'
import program from 'commander'
import tar from 'tar'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { cwdPath } from '../constants/conf'
import { error as printError } from '../utils/printer'
import { getTarball, installDepedences } from '../utils/pm'
import Templates from '../constants/template'

async function start(): Promise<void> {
  try {
    const files = fs.readdirSync(cwdPath)
    if (files.length > 0) {
      throw new Error('It is not an empty folder')
    }

    const selected = await inquirer.prompt({
      type: 'list',
      name: 'name',
      message: '请选择安装的模板',
      choices: Templates.map(item => item.alias),
    })

    const { name: template } = Templates.find(({ alias }) => alias === selected.name)
    const file = await getTarball(template)
    await tar.x({ file, cwd: cwdPath, strip: 1 })
    fs.unlinkSync(file)

    const regexp = /near\.(.+?)$/
    const needCopyFiles = fs
      .readdirSync(cwdPath)
      .filter(filename => regexp.test(filename))
      .map(filename => path.join(cwdPath, filename))
    needCopyFiles.length > 0 && needCopyFiles.forEach(file => fs.renameSync(file, file.replace(regexp, '.$1')))

    await installDepedences(cwdPath)

    const packageFile = path.join(__dirname, '../../package.json')
    const { name, version } = fs.readJSONSync(packageFile)

    console.log(chalk.green.bold('Install completed successfully.'))
    console.log(`Build by ${chalk.magentaBright(`${name}@${version}`)}`)
    console.log(`You can type ${chalk.cyan.bold('npm run product')} to build,`)
    console.log(`or type ${chalk.cyan.bold('npm start')} to serve.`)
  } catch (error) {
    printError(error)
  }
}

program.action(start)
