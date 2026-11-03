import { describe, expect, it } from 'vitest'
import { loadAlmanac } from './almanac.ts'
import { fromBacks } from './coins.ts'
import { DISCLAIMER } from './copy.ts'
import { LunarCastError } from './errors.ts'
import { HEXAGRAMS, hexById, hexByLines } from './catalog.ts'
import {
  castByNumbers,
  castByTimeParts,
  changedOf,
  hexFromTrigrams,
  modInto,
  monthPhase,
  mutualOf,
  relation,
} from './yijing.ts'

describe('數字起卦', () => {
  it('499／89 得震為雷，動五，互蹇，變隨', () => {
    const cast = castByNumbers(499, 89)
    expect(cast.id).toBe(51)
    expect(cast.moving).toBe(5)
    const primary = hexById(cast.id)
    expect(primary.name).toBe('震為雷')
    expect(primary.lines).toEqual([1, 0, 0, 1, 0, 0])
    expect(mutualOf(primary).name).toBe('水山蹇')
    expect(changedOf(primary, [5]).name).toBe('澤雷隨')
  })

  it('餘數 0 分別作未濟與上爻', () => {
    const cast = castByNumbers(128, 60)
    expect(cast.rem64).toBe(0)
    expect(cast.rem6).toBe(0)
    expect(hexById(cast.id).name).toBe('火水未濟')
    expect(cast.moving).toBe(6)
  })

  it('超出範圍會拒絕', () => {
    expect(() => castByNumbers(99, 80)).toThrow('數甲')
    expect(() => castByNumbers(200, 49)).toThrow('數乙')
  })
})

describe('時間起卦', () => {
  it('餘數 0 作坤與上爻', () => {
    const cast = castByTimeParts(1, 1, 6, 4)
    expect(cast.base).toBe(8)
    expect(cast.remUpper).toBe(0)
    expect(cast.upperName).toBe('坤')
    expect(cast.sum).toBe(12)
    expect(cast.lowerName).toBe('震')
    expect(cast.moving).toBe(6)
  })

  it('2026-11-03 正午只取本卦天地否', () => {
    const almanac = loadAlmanac(2026, 11, 3, 12, 0)
    expect(almanac.lunarMonth).toBe(9)
    expect(almanac.lunarDay).toBe(25)
    expect(almanac.yearZhi).toBe('午')
    expect(almanac.hourZhi).toBe('午')
    expect(almanac.yi.join('')).not.toMatch(/订|纳|无/)
    expect(almanac.yi).toContain('訂盟')
    const cast = castByTimeParts(
      almanac.yearZhiNum,
      almanac.lunarMonth,
      almanac.lunarDay,
      almanac.hourZhiNum,
    )
    expect(hexFromTrigrams(cast.lower, cast.upper).name).toBe('天地否')
    expect(cast.moving).toBe(6)
  })

  it('年支跟農曆年，不跟立春', () => {
    const almanac = loadAlmanac(2026, 2, 10, 12, 0)
    expect(almanac.yearZhi).toBe('巳')
    expect(almanac.ganZhiYear).toBe('乙巳')
  })

  it('閏月用正數月份', () => {
    const almanac = loadAlmanac(2025, 7, 25, 12, 0)
    expect(almanac.leap).toBe(true)
    expect(almanac.lunarMonth).toBe(6)
  })

  it('無效日期拒絕起卦', () => {
    expect(() => loadAlmanac(2026, 13, 1, 12, 0)).toThrow(LunarCastError)
    expect(() => loadAlmanac(2026, 2, 31, 12, 0)).toThrow(LunarCastError)
  })
})

describe('金錢卦字背', () => {
  it('三背老陽、兩背少陰、一背少陽、三字老陰', () => {
    expect(fromBacks(3)).toMatchObject({ name: '老陽', sum: 9, moving: true, mark: '●', chars: 0 })
    expect(fromBacks(2)).toMatchObject({ name: '少陰', sum: 8, moving: false, chars: 1 })
    expect(fromBacks(1)).toMatchObject({ name: '少陽', sum: 7, moving: false, chars: 2 })
    expect(fromBacks(0)).toMatchObject({ name: '老陰', sum: 6, moving: true, mark: '○', chars: 3 })
  })

  it('多動時所有動爻一齊變', () => {
    const primary = hexByLines([1, 1, 1, 1, 1, 1])
    const changed = changedOf(primary, [1, 2, 3, 4, 5, 6])
    expect(changed.name).toBe('坤為地')
    expect(changed.lines).toEqual([0, 0, 0, 0, 0, 0])
  })
})

describe('體用與月令', () => {
  it('生剋只報關係名', () => {
    expect(relation('木', '木')).toBe('比和')
    expect(relation('木', '火')).toBe('體生用')
    expect(relation('火', '木')).toBe('用生體')
    expect(relation('木', '土')).toBe('體剋用')
    expect(relation('火', '水')).toBe('用剋體')
  })

  it('午月火旺金死', () => {
    expect(monthPhase('午', '火')).toBe('旺')
    expect(monthPhase('午', '金')).toBe('死')
    expect(monthPhase('午', '土')).toBe('相')
  })
})

describe('餘數', () => {
  it('modInto 把 0 收回除數', () => {
    expect(modInto(64, 64)).toBe(64)
    expect(modInto(8, 8)).toBe(8)
    expect(modInto(6, 6)).toBe(6)
    expect(modInto(51, 64)).toBe(51)
  })
})

describe('變爻公開範圍', () => {
  it('收變爻全文，不收卦義說明同問事長文', () => {
    const first = HEXAGRAMS[0]
    expect(first?.bianyao.初爻?.startsWith('雖有實力')).toBe(true)
    expect(first?.bianyao.用九).toContain('剛柔並濟')
    expect(first?.yao[0]?.text).toContain('潛龍勿用')
    const packed = JSON.stringify(HEXAGRAMS)
    expect(packed).not.toContain('（變爻短摘待補）')
    expect(packed).not.toContain('卦義說明')
    expect(packed).not.toContain('乾卦以「龍」取象')
    expect(packed).not.toContain('家業繁榮，名利雙收')
  })
})

describe('免責聲明', () => {
  it('用鎖定字句', () => {
    expect(DISCLAIMER).toBe(
      '僅供文化／娛樂參考，唔構成專業諮詢；健康／投資／法律請另尋持牌人士。',
    )
  })
})
