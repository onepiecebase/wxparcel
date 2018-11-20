import path from 'path'
import stripComments from 'strip-comment'
import { Resolver } from './resolver'
import { replacement } from '../share'

const SRC_REGEXP = /src=["']([@~\w\d_\-./]*?)["']/

/**
 * WXML 解析器
 *
 * @export
 * @class WXMLResolver
 * @extends {Resolver}
 */
export default class WXMLResolver extends Resolver {
  /**
   * 解析, 并返回文件,代码,依赖等信息
   *
   * @return {Object} 包括文件, 代码, 依赖
   */
  resolve () {
    let source = this.source.toString()
    let dependencies = []

    source = stripComments(source)

    ;[source, dependencies] = this.revise([source, dependencies], SRC_REGEXP, {
      convertFinallyState: this.convertFinallyState.bind(this)
    })

    source = source.trim()
    source = Buffer.from(source)

    return { file: this.file, content: source, dependencies }
  }

  /**
   * 转换最终信息
   *
   * @param {String} source 代码
   * @param {Object} dependence 依赖
   * @param {String} dependence.code 匹配到的代码
   * @param {String} dependence.type 类型
   * @param {String} dependence.file 文件名路径
   * @param {String} dependence.dependency 依赖文件路径
   * @param {String} dependence.required 依赖匹配, 指代路径
   * @param {String} dependence.destination 目标路径
   * @return {Array} [source, dependence] 其中 dependence 不包含 code 属性
   */
  convertFinallyState (source, { code, dependency, destination, required, ...props }) {
    let extname = path.extname(destination)
    if (required.charAt(0) === '@' || extname === '' || /\.(wxs|wxml)$/.test(extname)) {
      let dependence = { dependency, destination, required, ...props }
      return [source, dependence]
    }

    let dependencyDestination = this.convertAssetsDestination(dependency)
    let url = this.convertPublicPath(dependencyDestination)
    source = replacement(source, code, url, SRC_REGEXP)

    let dependence = { dependency, destination: dependencyDestination, required, ...props }
    return [source, dependence]
  }
}
