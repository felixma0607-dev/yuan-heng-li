import type { Hexagram } from './types.ts'

export type DayHexCard = {
  name: string
  keyword: string
  lines: number[]
  image: string
  plain: string
}

/** 首頁日卦：爻線用本卦，卦象用站方整理，白話一句取口訣。 */
export function dayHexCard(
  hex: Pick<Hexagram, 'name' | 'keyword' | 'lines' | 'imagePhrase' | 'motto'>,
): DayHexCard {
  const motto = hex.motto.trim().replace(/[。！？!?．.\s]+$/u, '')
  return {
    name: hex.name,
    keyword: hex.keyword,
    lines: hex.lines,
    image: hex.imagePhrase.trim(),
    plain: `${motto}。`,
  }
}
