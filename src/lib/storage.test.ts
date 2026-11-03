import { describe, expect, it } from 'vitest'
import { prepareQuestion } from './storage.ts'

describe('問句可留空', () => {
  it('空白唔擋起卦', () => {
    expect(prepareQuestion('')).toEqual({ question: '', norm: '' })
    expect(prepareQuestion('   \n\t  ')).toEqual({ question: '', norm: '' })
  })

  it('有字先修剪並正規化，方便記低', () => {
    expect(prepareQuestion('  今日 宜 行  ')).toEqual({
      question: '今日 宜 行',
      norm: '今日宜行',
    })
  })
})
