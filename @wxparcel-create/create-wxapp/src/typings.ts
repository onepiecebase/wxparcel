export type ProcessStdout = (data: Buffer, type?: string) => void

export type PackageManager = 'yarn' | 'npm'
