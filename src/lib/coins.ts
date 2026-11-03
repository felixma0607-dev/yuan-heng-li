export const COIN_FACES = [
  { backs: 3, chars: 0, sum: 9, name: '老陽', yinYang: '陽', moving: true, mark: '●', label: '三背·老陽' },
  { backs: 2, chars: 1, sum: 8, name: '少陰', yinYang: '陰', moving: false, mark: '', label: '兩背·少陰' },
  { backs: 1, chars: 2, sum: 7, name: '少陽', yinYang: '陽', moving: false, mark: '', label: '一背·少陽' },
  { backs: 0, chars: 3, sum: 6, name: '老陰', yinYang: '陰', moving: true, mark: '○', label: '三字·老陰' },
] as const

export type CoinFace = (typeof COIN_FACES)[number]

export function fromBacks(backs: number): CoinFace {
  const face = COIN_FACES.find((item) => item.backs === backs)
  if (!face) {
    throw new Error('背數只可 0 至 3')
  }
  return face
}

export function tossBacks(): number {
  let backs = 0
  for (let index = 0; index < 3; index += 1) {
    if (Math.random() < 0.5) backs += 1
  }
  return backs
}

export function coinBit(face: CoinFace): number {
  return face.yinYang === '陽' ? 1 : 0
}
