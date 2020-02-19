import { spawn as cpSpawn, SpawnOptions } from 'child_process'

export function spawn(cli: string, params?: string[], options: SpawnOptions = { stdio: 'inherit' }) {
  return new Promise((resolve, reject) => {
    let cp = cpSpawn(cli, params, options)

    let onCpExit = (code: number): void => {
      code === 0 ? resolve() : reject(new Error(`Spwan exit, code: ${code}`))
    }

    let onCpError = (error: Error): void => {
      reject(error)
    }

    let onProcessSigint = (): void => {
      process.exit(0)
    }

    let onProcessExit = (): void => {
      cp && cp.kill('SIGINT')
      process.removeListener('exit', onProcessExit)
      process.removeListener('SIGINT', onProcessSigint)

      cp.removeListener('exit', onCpExit)
      cp.removeListener('error', onCpError)

      onProcessExit = undefined
      onProcessSigint = undefined
      onCpExit = undefined
      onCpError = undefined

      cp = undefined
    }

    cp.once('exit', onCpExit)
    cp.once('error', onCpError)

    process.on('exit', onProcessExit)
    process.on('SIGINT', onProcessSigint)
  })
}
