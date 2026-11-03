import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HEXAGRAMS } from '../lib/catalog.ts'

export function HexList() {
  const [query, setQuery] = useState('')
  const items = useMemo(() => {
    const text = query.trim()
    if (!text) return HEXAGRAMS
    return HEXAGRAMS.filter((hex) => {
      return (
        hex.name.includes(text) ||
        hex.short.includes(text) ||
        hex.keyword.includes(text) ||
        hex.motto.includes(text) ||
        String(hex.id) === text
      )
    })
  }, [query])

  return (
    <article className="page">
      <h1>六十四卦</h1>
      <label className="stack">
        搜尋
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="卦名、卦序或關鍵詞"
        />
      </label>
      {items.length === 0 ? (
        <p className="note">冇符合的卦。</p>
      ) : (
        <div className="hex-grid">
          {items.map((hex) => (
            <Link key={hex.id} to={`/hexagrams/${hex.id}`} className="hex-cell">
              <span className="symbol">{hex.symbol}</span>
              <strong>
                {hex.id} {hex.short}
              </strong>
              <span>{hex.keyword}</span>
            </Link>
          ))}
        </div>
      )}
    </article>
  )
}
