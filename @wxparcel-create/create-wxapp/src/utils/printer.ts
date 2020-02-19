import chalk from 'chalk'
import PrettyError from 'pretty-error'

export const error = (error: Error): void => {
  const pe = new PrettyError()
  error.message = chalk.red(error.message)

  const message = pe.render(error)
  console.log(message)
}
