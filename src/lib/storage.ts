export type StoredMeihua = {
  at: number
  question: string
  norm: string
  mode: 'time' | 'number'
  primaryId: number
  mutualId: number
  changedId: number
  moving: number[]
  formula: string[]
  monthZhi: string
  bodyName: string
  bodyElement: string
  bodyPhase: string
  useName: string
  useElement: string
  usePhase: string
  relation: string
  compareLines: string[] | null
}

const KEY = 'yuanhengli.meihua.v1'
const DAY = 24 * 60 * 60 * 1000

export function normQuestion(question: string): string {
  return question.trim().replace(/\s+/g, '')
}

/** 問句可留空。有字先修剪，並用 norm 對同一問題。 */
export function prepareQuestion(raw: string): { question: string; norm: string } {
  const question = raw.trim()
  return { question, norm: normQuestion(question) }
}

function readAll(): StoredMeihua[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredMeihua[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function findRecentMeihua(question: string, now = Date.now()): StoredMeihua | null {
  const norm = normQuestion(question)
  if (!norm) return null
  return readAll().find((item) => item.norm === norm && now - item.at < DAY) ?? null
}

export function saveMeihua(cast: StoredMeihua) {
  const next = [cast, ...readAll().filter((item) => item.norm !== cast.norm)].slice(0, 20)
  localStorage.setItem(KEY, JSON.stringify(next))
}
