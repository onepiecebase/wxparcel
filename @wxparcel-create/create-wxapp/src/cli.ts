import program from 'commander'
import { projectVerion } from './constants/conf'
import './commander/create'

program.version(projectVerion, '-v, --version')

const argv = process.argv
program.parse(argv)
