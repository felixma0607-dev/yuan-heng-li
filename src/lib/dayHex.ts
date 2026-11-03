import type { Hexagram } from './types.ts'

export type DayHexCard = {
  name: string
  keyword: string
  image: string
  plain: string
}

/** 首頁日卦：卦象用站方整理，白話一句取口訣，不另寫長文。 */
export function dayHexCard(hex: Pick<Hexagram, 'name' | 'keyword' | 'imagePhrase' | 'motto'>): DayHexCard {
  const motto = hex.motto.trim().replace(/[。！？!?．.\s]+$/u, '')
  return {
    name: hex.name,
    keyword: hex.keyword,
    image: hex.imagePhrase.trim(),
    plain: `${motto}。`,
  }
}
