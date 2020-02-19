import fs from 'fs-extra'
import path from 'path'
import program from 'commander'
import inquirer from 'inquirer'
import tar from 'tar'
import { cwdPath } from '../constants/conf'
import { error as printError } from '../utils/printer'
import { getTarball, installDepedences } from '../utils/pm'
import Templates from '../constants/template'

async function start(): Promise<void> {
  try {
    const files = fs.readdirSync(cwdPath)
    if (files.length > 0) {
      throw new Error('当前文件夹不是一个空白的文件夹')
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
  } catch (error) {
    printError(error)
  }
}

program.action(start)
