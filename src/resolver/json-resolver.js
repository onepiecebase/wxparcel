import fs from 'fs-extra'
import path from 'path'
import get from 'lodash/get'
import flatten from 'lodash/flatten'
import forEach from 'lodash/forEach'
import isPlainObject from 'lodash/isPlainObject'
import { Resolver } from './resolver'

const JSON_REGEXP = /\.json$/
const JS_REGEXP = /\.js$/
const WXML_REGEXP = /\.wxml$/
const WXSS_REGEXP = /\.wxss$/

export class JsonResolver extends Resolver {
  resolve (source, file) {
    let config = {}

    if (isPlainObject(source)) {
      config = source

      try {
        source = JSON.stringify(source)
      } catch (error) {
        throw new Error(`File ${file} is invalid json, please check the json corrected.\n${error}`)
      }
    } else {
      try {
        config = JSON.parse(source)
      } catch (error) {
        throw new Error(`File ${file} is invalid json, please check the json corrected.\n${error}`)
      }
    }

    let pages = this.resolvePages(config, file, this.options)
    let components = this.resolveComponents(config, file, this.options)
    let files = pages.concat(components).map((item) => item.files)
    files = flatten(files)

    let images = this.resolveImages(config, file, this.options)
    let dependencies = files.concat(images).map((dependency) => {
      let destination = this.resolveDestination(dependency, this.options)
      return { file, dependency, destination, required: '' }
    })

    return { file, source: Buffer.from(source), dependencies }
  }

  resolvePages (config = {}) {
    let pages = config.pages || []
    let subPackages = config.subPackages || []
    let subPages = subPackages.map((item) => item.pages || [])
    subPages = flatten(subPages)

    pages = pages.concat(subPages)
    pages = pages.map((page) => {
      page = path.join(this.options.srcDir, page)

      let folder = path.dirname(page)
      if (!fs.existsSync(folder)) {
        throw new Error(`查找不到文件夹 ${folder}`)
      }

      let name = path.basename(page)
      return this.findModule(name, folder)
    })

    return pages
  }

  resolveComponents (config = {}, file) {
    let usingComponents = config.usingComponents || {}
    let relativePath = path.dirname(file)
    let components = []

    forEach(usingComponents, (component) => {
      let realtiveFolder = path.dirname(component)
      let folder = this.resolveRelative(realtiveFolder, [relativePath, this.options.srcDir])

      if (folder) {
        let name = path.basename(component)
        components.push(this.findModule(name, folder))
      }
    })

    return components
  }

  resolveImages (config = {}, file) {
    let tabs = get(config, 'tabBar.list', [])
    let images = []
    let basePath = path.dirname(file)

    tabs.forEach(({ iconPath, selectedIconPath }) => {
      if (iconPath) {
        iconPath = path.join(basePath, iconPath)
        images.indexOf(iconPath) === -1 && images.push(iconPath)
      }

      if (selectedIconPath) {
        selectedIconPath = path.join(basePath, selectedIconPath)
        images.indexOf(selectedIconPath) === -1 && images.push(selectedIconPath)
      }
    })

    return images
  }

  resolveRelative (file, paths) {
    if (!Array.isArray(paths) || paths.length === 0) {
      throw new Error('Paths is not a array or not be provided')
    }

    for (let i = 0, l = paths.length; i < l; i++) {
      let dir = paths[i]
      let target = path.join(dir, file)

      if (fs.existsSync(target)) {
        return target
      }
    }

    return false
  }

  findModule (name, folder) {
    if (!folder) {
      throw new TypeError('Folder is not provided')
    }

    if (!fs.statSync(folder).isDirectory()) {
      throw new Error(`Folder ${folder} is not found or not a folder`)
    }

    let files = fs.readdirSync(folder)
    let regexp = new RegExp(name)

    files = files.filter((file) => {
      if (!regexp.test(path.basename(file))) {
        return false
      }

      let tester = [JSON_REGEXP, JS_REGEXP, WXML_REGEXP, WXSS_REGEXP]
      let index = tester.findIndex((regexp) => regexp.test(file))
      if (index !== -1) {
        return true
      }

      let { rules } = this.options
      if (Array.isArray(rules)) {
        let index = rules.findIndex((rule) => rule.test.test(file))
        if (index !== -1) {
          return true
        }
      }
    })

    files = files.map((file) => path.join(folder, file))
    return { name, dir: folder, files }
  }
}
