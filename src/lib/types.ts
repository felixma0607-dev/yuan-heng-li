export type TrigramName = '乾' | '兌' | '離' | '震' | '巽' | '坎' | '艮' | '坤'
export type ElementName = '金' | '木' | '水' | '火' | '土'
export type YaoKey = '初爻' | '二爻' | '三爻' | '四爻' | '五爻' | '上爻'
export type BianKey = YaoKey | '用九' | '用六'

export type LineText = {
  position: string
  text: string
}

export type Hexagram = {
  id: number
  name: string
  short: string
  upper: TrigramName
  lower: TrigramName
  lines: number[]
  symbol: string
  keyword: string
  fortune: string
  motto: string
  imagePhrase: string
  judgment: string
  greatImage: string
  yao: LineText[]
  yong: LineText | null
  bianyao: Partial<Record<BianKey, string>>
}

export type Ymd = {
  year: number
  month: number
  day: number
}
