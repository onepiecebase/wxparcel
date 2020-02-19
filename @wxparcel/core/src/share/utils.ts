import fs from 'fs'
import crypto from 'crypto'

/**
 * 反斜杠转义
 * @param source 代码
 * @returns 代码
 */
export const escapeRegExp = (source: string): string => {
  return source.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

/**
 * 替换
 * @param source 代码
 * @param string 需要修改的字符串
 * @param url 路径
 * @param regexp 正则
 * @returns 结果
 */
export const replacement = (source: string, content: string, url: string, regexp: RegExp) => {
  source = source.replace(new RegExp(escapeRegExp(content), 'ig'), () => {
    return content.replace(regexp, (content, ...file: string[]) => {
      const result = file.find((item: string) => typeof item !== 'undefined')
      return content.replace(result, url)
    })
  })

  return source
}

/**
 * 生成 hash
 * @param source 原字符串
 * @returns 哈希
 */
export const gen = (source: Buffer): string => {
  return crypto
    .createHash('md5')
    .update(source)
    .digest('hex')
    .substr(0, 7)
}

/**
 * 根据文件内容生成 hash
 * @param file 文件名
 * @returns 哈希
 */
export const genFileSync = (file: string): string => {
  const source = fs.readFileSync(file)
  return gen(source)
}

/**
 * strip utf-8 with BOM
 *
 * @description
 * some editor or nodeJS in windows will prepend
 * 0xFEFF to the code it will change to utf8 BOM
 *
 * @param content 内容
 */
export const stripBOM = <T = string | Buffer>(content: T): T => {
  if (Buffer.isBuffer(content)) {
    if (content[0] === 0xef && content[1] === 0xbb && content[2] === 0xbf) {
      return content.slice(3) as any
    }

    return content
  }

  if (typeof content === 'string') {
    if (content.charCodeAt(0) === 0xfeff) {
      return content.slice(1) as any
    }
  }

  return content
}

/**
 * 是否命中其中一个正则
 * @param string 字符串
 * @param regexps 正则集合
 * @returns 是否命中
 */
export const inMatches = (content: string, regexps: RegExp[]): boolean => {
  for (let i = 0; i < regexps.length; i++) {
    if (regexps[i].test(content)) {
      return true
    }
  }

  return false
}

/**
 * 判断是否同一个输出地址
 * @param pathA 路径A
 * @param pathB 路径B
 * @param {boolean}
 */
export const isSameOutPath = (pathA: string, pathB: string, dirs: string[]): boolean => {
  if (typeof pathA !== 'string' || typeof pathB !== 'string') {
    throw new Error('Path must be a string')
  }

  return dirs.findIndex(dir => pathA.search(dir) !== -1 && pathB.search(dir) !== -1) !== -1
}
