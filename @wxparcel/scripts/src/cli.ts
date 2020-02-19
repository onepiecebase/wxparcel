import program from 'commander'
import { GlobalLogger } from 'wxparcel-core'
import Project from './constants/project'
import './commander/parcel'

const helpAction = (): void => {
  GlobalLogger.print('\nExamples:')
  GlobalLogger.print('  $ wxparcel-script start --env development --watch')
  GlobalLogger.print('  $ wxparcel-script start --env production --config wx.config.js')
}

program
  .version(Project.version, '-v, --version')
  .option('-q, --quiet', 'do not print any information')
  .on('--help', helpAction)

const params = process.argv
!params.slice(2).length && program.outputHelp()
program.parse(params)
