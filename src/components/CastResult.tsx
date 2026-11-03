import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PURE_HEX_NOTE, YAO_KEYS } from '../lib/copy.ts'
import { movingRows } from '../lib/yijing.ts'
import type { Hexagram } from '../lib/types.ts'
import { DisclaimerBox } from './DisclaimerBox.tsx'
import { HexLines } from './HexLines.tsx'

export function CastResult({
  question,
  method,
  primary,
  changed,
  moving,
  rest,
}: {
  question: string
  method: string
  primary: Hexagram
  changed: Hexagram
  moving: number[]
  rest: ReactNode
}) {
  const rows = movingRows(primary, moving)
  const multi = moving.length > 1
  const pure = primary.upper === primary.lower && moving.length === 0

  return (
    <section className="result" aria-live="polite">
      <div className="summary">
        <p className="method">{method}</p>
        {question ? <h2 className="question">{question}</h2> : null}
        <div className="pair">
          <Link to={`/hexagrams/${primary.id}`} className="pair-card">
            <HexLines lines={primary.lines} moving={moving} />
            <span>
              本卦　{primary.name}
              <small>第{primary.id}卦</small>
            </span>
          </Link>
          <span className="arrow" aria-hidden="true">
            →
          </span>
          <Link to={`/hexagrams/${changed.id}`} className="pair-card">
            <HexLines lines={changed.lines} />
            <span>
              變卦　{changed.name}
              <small>第{changed.id}卦</small>
            </span>
          </Link>
        </div>
        <p className="moving-label">
          {multi ? '多動' : moving.length === 1 ? `動${YAO_KEYS[moving[0] - 1]}` : '無動爻'}
          {multi ? '　各動爻皆變' : ''}
        </p>
        {rows.length === 0 ? (
          <p>六爻皆靜，沒有單一動爻可引。</p>
        ) : (
          rows.map((row) => (
            <div key={row.key} className="line-read">
              <h3>{row.key}白話</h3>
              <p>{row.plain}</p>
              <p className="source">站方整理 · 變爻全文</p>
              <h3>{row.key}爻辭</h3>
              <p>{row.scripture}</p>
              <p className="source">通行本</p>
            </div>
          ))
        )}
        {pure ? (
          <p className="pure-note">
            {PURE_HEX_NOTE}
            <span className="source">講義原文要點</span>
          </p>
        ) : null}
      </div>
      <DisclaimerBox />
      <details className="rest">
        <summary>其餘</summary>
        {rest}
      </details>
    </section>
  )
}
