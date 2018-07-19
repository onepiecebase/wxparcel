import { Chunk } from './chunk'
import OptionManager from './option-manager'

export class Assets {
  get size () {
    return this.chunks.length
  }

  constructor (options = OptionManager) {
    this.options = options
    this.chunks = []
  }

  index (file) {
    return this.chunks.findIndex((chunk) => chunk.file === file)
  }

  add (file, state = {}) {
    let chunk = new Chunk(file, state, this.options)
    this.chunks.push(chunk)
    return chunk
  }

  update (file, state = {}) {
    let chunk = this.get(file)
    chunk && chunk.update(state)
  }

  get (file) {
    let index = this.index(file)
    return this.chunks[index] || null
  }

  del (file) {
    let index = this.index(file)
    index !== -1 && this.chunks.splice(index, 1)
  }

  exists (file) {
    return this.index(file) !== -1
  }

  clean () {
    let chunks = this.chunks.splice(0)
    this.chunks = []

    chunks.forEach((chunk) => chunk.destory())
  }
}

export default new Assets()
