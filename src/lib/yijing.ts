import { hexById, hexByLines } from './catalog.ts'
import { YAO_KEYS } from './copy.ts'
import { InputError } from './errors.ts'
import type { ElementName, Hexagram, TrigramName } from './types.ts'

export const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

export const TRIGRAMS: {
  n: number
  name: TrigramName
  lines: [number, number, number]
  element: ElementName
}[] = [
  { n: 1, name: '乾', lines: [1, 1, 1], element: '金' },
  { n: 2, name: '兌', lines: [1, 1, 0], element: '金' },
  { n: 3, name: '離', lines: [1, 0, 1], element: '火' },
  { n: 4, name: '震', lines: [1, 0, 0], element: '木' },
  { n: 5, name: '巽', lines: [0, 1, 1], element: '木' },
  { n: 6, name: '坎', lines: [0, 1, 0], element: '水' },
  { n: 7, name: '艮', lines: [0, 0, 1], element: '土' },
  { n: 8, name: '坤', lines: [0, 0, 0], element: '土' },
]

const SHENG: Record<ElementName, ElementName> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
}

const KE: Record<ElementName, ElementName> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木',
}

const SEASON: Record<string, ElementName> = {
  寅: '木',
  卯: '木',
  巳: '火',
  午: '火',
  申: '金',
  酉: '金',
  亥: '水',
  子: '水',
  辰: '土',
  丑: '土',
  未: '土',
  戌: '土',
}

/** 常規月令表：旺、相、休、囚、死。鍵是當令五行。 */
const PHASE: Record<ElementName, Record<ElementName, string>> = {
  木: { 木: '旺', 火: '相', 水: '休', 金: '囚', 土: '死' },
  火: { 火: '旺', 土: '相', 木: '休', 水: '囚', 金: '死' },
  金: { 金: '旺', 水: '相', 土: '休', 火: '囚', 木: '死' },
  水: { 水: '旺', 木: '相', 金: '休', 土: '囚', 火: '死' },
  土: { 土: '旺', 金: '相', 火: '休', 木: '囚', 水: '死' },
}

export function modInto(value: number, divisor: number): number {
  const remainder = value % divisor
  return remainder === 0 ? divisor : remainder
}

export function trigramByNumber(n: number) {
  const trigram = TRIGRAMS[n - 1]
  if (!trigram) {
    throw new Error('八卦數無效')
  }
  return trigram
}

export function linesFromTrigrams(lower: number, upper: number): number[] {
  return [...trigramByNumber(lower).lines, ...trigramByNumber(upper).lines]
}

export function hexFromTrigrams(lower: number, upper: number): Hexagram {
  return hexByLines(linesFromTrigrams(lower, upper))
}

export function mutualOf(hex: Hexagram): Hexagram {
  const lines = hex.lines
  return hexByLines([lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]])
}

export function changedOf(hex: Hexagram, moving: number[]): Hexagram {
  const next = hex.lines.slice()
  for (const index of moving) {
    next[index - 1] = next[index - 1] === 1 ? 0 : 1
  }
  return hexByLines(next)
}

export function castByNumbers(first: number, second: number) {
  if (!Number.isInteger(first) || first < 100 || first > 500) {
    throw new InputError('數甲要係 100 至 500 的整數。')
  }
  if (!Number.isInteger(second) || second < 50 || second > 100) {
    throw new InputError('數乙要係 50 至 100 的整數。')
  }
  return {
    id: modInto(first, 64),
    moving: modInto(second, 6),
    rem64: first % 64,
    rem6: second % 6,
    first,
    second,
  }
}

export function castByEight(first: number, second: number) {
  return {
    upper: modInto(first, 8),
    lower: modInto(second, 8),
    moving: modInto(first + second, 6),
    remUpper: first % 8,
    remLower: second % 8,
    remMoving: (first + second) % 6,
  }
}

export function castByTimeParts(
  yearZhiNum: number,
  lunarMonth: number,
  lunarDay: number,
  hourZhiNum: number,
) {
  const base = yearZhiNum + lunarMonth + lunarDay
  const sum = base + hourZhiNum
  const upper = modInto(base, 8)
  const lower = modInto(sum, 8)
  const moving = modInto(sum, 6)
  return {
    base,
    sum,
    upper,
    lower,
    moving,
    upperName: trigramByNumber(upper).name,
    lowerName: trigramByNumber(lower).name,
    remUpper: base % 8,
    remLower: sum % 8,
    remMoving: sum % 6,
  }
}

export function numberFormula(first: number, second: number) {
  const cast = castByNumbers(first, second)
  const hex = hexById(cast.id)
  return {
    cast,
    hex,
    lines: [
      `本卦序：${first}÷64 餘 ${cast.rem64} → 第 ${cast.id} 卦 ${hex.name}`,
      `動爻：${second}÷6 餘 ${cast.rem6} → ${YAO_KEYS[cast.moving - 1]}`,
    ],
  }
}

export function eightFormula(first: number, second: number) {
  const cast = castByEight(first, second)
  const hex = hexFromTrigrams(cast.lower, cast.upper)
  return {
    cast,
    hex,
    lines: [
      `僅對照。數甲 ${first}÷8 餘 ${cast.remUpper} → 上卦 ${trigramByNumber(cast.upper).name}`,
      `數乙 ${second}÷8 餘 ${cast.remLower} → 下卦 ${trigramByNumber(cast.lower).name}`,
      `兩數和÷6 餘 ${cast.remMoving} → ${YAO_KEYS[cast.moving - 1]}`,
      `對照本卦：${hex.name}`,
    ],
  }
}

export function timeFormula(input: {
  yearZhi: string
  yearZhiNum: number
  lunarMonth: number
  lunarDay: number
  hourZhi: string
  hourZhiNum: number
  leap: boolean
}) {
  const cast = castByTimeParts(
    input.yearZhiNum,
    input.lunarMonth,
    input.lunarDay,
    input.hourZhiNum,
  )
  const lines = [
    `上卦：（年支${input.yearZhi}${input.yearZhiNum}＋農曆月${input.lunarMonth}＋農曆日${input.lunarDay}）＝${cast.base}，${cast.base}÷8 餘 ${cast.remUpper} → ${cast.upper}${cast.upperName}`,
    `下卦：（${cast.base}＋時支${input.hourZhi}${input.hourZhiNum}）＝${cast.sum}，${cast.sum}÷8 餘 ${cast.remLower} → ${cast.lower}${cast.lowerName}`,
    `動爻：${cast.sum}÷6 餘 ${cast.remMoving} → ${YAO_KEYS[cast.moving - 1]}`,
  ]
  if (input.leap) {
    lines.push(`閏月用該月序數 ${input.lunarMonth}，不另加一。〔推論〕`)
  }
  return { cast, lines }
}

export function relation(body: ElementName, use: ElementName): string {
  if (body === use) return '比和'
  if (SHENG[use] === body) return '用生體'
  if (SHENG[body] === use) return '體生用'
  if (KE[body] === use) return '體剋用'
  if (KE[use] === body) return '用剋體'
  throw new Error('五行關係無法判定')
}

export function monthPhase(monthZhi: string, element: ElementName): string {
  const season = SEASON[monthZhi]
  if (!season) {
    throw new Error('月建地支無效')
  }
  return PHASE[season][element]
}

export function bodyUse(hex: Hexagram, monthZhi: string) {
  const lower = trigramByNumber(TRIGRAMS.find((item) => item.name === hex.lower)!.n)
  const upper = trigramByNumber(TRIGRAMS.find((item) => item.name === hex.upper)!.n)
  return {
    body: {
      name: lower.name,
      element: lower.element,
      phase: monthPhase(monthZhi, lower.element),
    },
    use: {
      name: upper.name,
      element: upper.element,
      phase: monthPhase(monthZhi, upper.element),
    },
    relation: relation(lower.element, upper.element),
    monthZhi,
  }
}

export function movingRows(hex: Hexagram, moving: number[]) {
  return moving.map((index) => {
    const key = YAO_KEYS[index - 1]
    return {
      index,
      key,
      plain: hex.bianyao[key] ?? '（此爻變爻未備）',
      scripture: hex.yao[index - 1]?.text ?? '（爻辭未備）',
    }
  })
}
