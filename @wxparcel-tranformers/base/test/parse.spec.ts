import path from 'path'
import { expect } from 'chai'
import Parser from '@/index'

const file = __filename
const source = Buffer.from('something...')
const params = { file, source }

describe('测试 Parser', () => {
  it('能初始化', () => {
    const parser = new Parser(params)
    expect(parser).instanceOf(Parser)

    // 必须拥有该方法
    expect(parser).has.property('parse')
  })

  it('拥有 parse 方法', async () => {
    const code = 'some code...'
    const source = Buffer.from(code)
    const file = 'my.ts'
    const parser = new Parser({ source, file })
    const result = await parser.parse()

    expect(result).has.property('code')
    expect(result).has.property('map')
    expect(result).has.property('ast')
    expect(result).has.property('dependencies')

    expect(result.code).to.be.instanceOf(Buffer)
    expect(result.map).to.be.eq(null)
    expect(result.ast).to.be.eq(null)
    expect(result.dependencies).to.be.an('array')
  })

  it('拥有 matchAlias 方法', () => {
    const parser = new Parser(params)
    const required = '@/index'
    const alias = {
      '@/*': ['src/*']
    }

    const matches = parser.matchAlias(required, alias)
    expect(matches).to.be.an('array')
    expect(matches).has.length(1)
    expect(matches).to.deep.equal(['src/*'])

    const notMathes = parser.matchAlias('@notfound/index', alias)
    expect(notMathes).to.be.an('array')
    expect(notMathes).to.be.empty
  })

  it('拥有 findFile 方法', async () => {
    const parser = new Parser(params)
    const required = `./test/${path.basename(__filename)}`
    const alias = 'test/*'

    const matches = await parser.findFile(required, alias)
    expect(matches).to.be.a('string')
    expect(matches).to.equal(__filename)

    const noMatches = await parser.findFile('./test/notfound.ts', alias)
    expect(noMatches).to.equal(undefined)
  })

  it('拥有 findFileByAlias 方法', async () => {
    const parser = new Parser(params)
    const required = `@/${path.basename(__filename)}`
    const alias = {
      '@/*': ['test/*'],
    }

    const matches = await parser.findFileByAlias(required, alias)
    expect(matches).to.be.a('string')
    expect(matches).to.equal(__filename)
  })
})
