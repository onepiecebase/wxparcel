// Resolvers
export { default as JSResolver } from './resolver/js-resolver'
export { default as JSONResolver } from './resolver/json-resolver'
export { default as WXMLResolver } from './resolver/wxml-resolver'
export { default as WXSResolver } from './resolver/wxs-resolver'
export { default as WXSSResolver } from './resolver/wxss-resolver'

// Libs
export { default as JSBundler } from './libs/bundler/JSBundler'
export { default as Assets } from './libs/Assets'
export { default as Chunk } from './libs/Chunk'
export { default as OptionManager } from './libs/OptionManager'
export { default as Parser } from './libs/Parser'
export { default as Resolver } from './resolver'
export { default as Bundler } from './libs/bundler'
export { default as Parcel } from './libs/Parcel'
export { default as Logger } from './libs/Logger'

// Services
export { default as GlobalAssets } from './services/assets'
export { default as GlobalBundler } from './services/bundler'
export { default as GlobalLogger } from './services/logger'
export { default as GlobalOptionManager } from './services/option-manager'
export { default as GlobalParser } from './services/parser'
export { default as GlobalResolver } from './services/resolver'

// Constants
export { BUNDLE, BUNDLER, SCATTER, ENTRY } from './constants/chunk-type'

// Utils
export { escapeRegExp, replacement, gen, genFileSync, stripBOM, inMatches, isSameOutPath } from './share/utils'

export { localRequire, localResolve, resolve, resolvePaths, resolveTruthModuleName } from './share/module'

export { installDependencies, installPeerDependencies, determinePackageManager, detectSupportYarn, fetchNpmLinks } from './share/pm'

export { onexit, spawn, kill, pipeSpawn } from './share/process'

export { getConsumer, getSourceNode } from './share/source-map'

// Typings
export {
  ParcelOptions,
  ParcelWatchOptions,
  ParcelOptionRule,
  ParcelOptionRuleLoader,
  ParcelLoaderOptions,
  ParcelLoader,
  ParcelChunkState,
  ParcelPlugin,
  ParcelChunkDependency,
  PMInstallOptions,
  ProcessStdout,
  WXProjectConfig,
  WXPageConfig,
  WXPluginConfig,
  ValueOf,
  NonFunctionPropertyNames,
  NonFunctionProperties,
} from './typings'
