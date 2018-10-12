import path from 'path'
import trimEnd from 'lodash/trimEnd'
import trimStart from 'lodash/trimStart'
import stripCssComments from 'strip-css-comments'
import { Resolver } from './resolver'
import { escapeRegExp } from './share'

const IMAGE_REGEXP = /require\(['"]([~\w\d_\-./]+?)['"]\)/

/**
 * WXSS解析器
 *
 * @export
 * @class WXSSResolver
 * @extends {Resolver}
 */
export default class WXSSResolver extends Resolver {
  /**
   * 解析, 并返回文件,代码,依赖等信息
   *
   * @return {Object} 包括文件, 代码, 依赖
   */
  resolve () {
    const { staticDir, pubPath } = this.options

    this.source = this.source.toString()
    this.source = stripCssComments(this.source)

    let imageDeps = this.resolveDependencies(IMAGE_REGEXP, {
      convertDestination: this.convertAssetsDestination.bind(this)
    })

    let dependencies = [].concat(imageDeps)
    dependencies = dependencies.map((item) => {
      let { file, destination, dependency, required, code } = item
      let relativePath = destination.replace(staticDir, '')
      let url = trimEnd(pubPath, path.sep) + '/' + trimStart(relativePath, path.sep)

      this.source = this.source.replace(new RegExp(escapeRegExp(code), 'ig'), `"${url}"`)
      return { file, destination, dependency, required }
    })

    this.source = Buffer.from(this.source)
    return { file: this.file, source: this.source, dependencies }
  }
}
