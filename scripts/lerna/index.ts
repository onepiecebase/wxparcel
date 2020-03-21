import { program } from 'commander'

import './command/add'
import './command/exec'

program
.name('lerna-script')
.usage('<command> [options]')
.parse(['node', 'lerna-script']
.concat(process.argv.slice(2)))
