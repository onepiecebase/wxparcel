import fs from 'fs-extra'
import path from 'path'

interface PackageJson {
  name: string;
  version: string;
}

const packageJson: PackageJson = fs.readJSONSync(path.join(__dirname, '../../package.json'))

export const projectName = packageJson.name
export const projectVerion = packageJson.version
export const cwdPath = process.cwd()
export const rootPath = path.join(__dirname, '../../')
export const tempPath = path.join(rootPath, '.temporary')
