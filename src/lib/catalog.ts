import raw from '../data/hexagrams.json' with { type: 'json' }
import type { Hexagram } from './types.ts'

export const HEXAGRAMS = raw as Hexagram[]

const byId = new Map(HEXAGRAMS.map((hex) => [hex.id, hex]))
const byLines = new Map(HEXAGRAMS.map((hex) => [hex.lines.join(''), hex]))

export function hexById(id: number): Hexagram {
  const hex = byId.get(id)
  if (!hex) {
    throw new Error('卦序不存在')
  }
  return hex
}

export function hexByLines(lines: number[]): Hexagram {
  const hex = byLines.get(lines.join(''))
  if (!hex) {
    throw new Error('卦象對不上六十四卦')
  }
  return hex
}
