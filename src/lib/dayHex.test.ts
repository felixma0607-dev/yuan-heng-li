import { describe, expect, it } from 'vitest'
import { hexById, HEXAGRAMS } from './catalog.ts'
import { HOME_HARD } from './copy.ts'
import { dayHexCard } from './dayHex.ts'

describe('首頁日卦卡', () => {
  it('天地否同時給出卦象同一句白話，關鍵詞仍在', () => {
    const hex = hexById(12)
    expect(hex.name).toBe('天地否')
    expect(hex.keyword).toBe('閉塞不通')
    const card = dayHexCard(hex)
    expect(card.keyword).toBe('閉塞不通')
    expect(card.image).toBe('天在上地在下，天地不交')
    expect(card.plain).toBe('谷底期防小人，儉德避難，充實自己。')
    expect(card.plain.endsWith('。')).toBe(true)
    expect(card.plain.length).toBeLessThan(40)
  })

  it('六十四卦都用站方整理的卦象同口訣，不另寫長文', () => {
    for (const hex of HEXAGRAMS) {
      const card = dayHexCard(hex)
      expect(card.image).toBe(hex.imagePhrase)
      expect(card.plain).toBe(`${hex.motto.replace(/[。！？!?．.\s]+$/u, '')}。`)
      expect(card.plain).not.toContain(hex.judgment)
      expect(card.image.length).toBeGreaterThan(0)
    }
  })

  it('保留不代替正式占問', () => {
    expect(HOME_HARD).toBe('不代替正式占問')
  })
})
