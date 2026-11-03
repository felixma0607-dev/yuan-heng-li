import { Link, useParams } from 'react-router-dom'
import { HexLines } from '../components/HexLines.tsx'
import { hexById } from '../lib/catalog.ts'
import { YAO_KEYS } from '../lib/copy.ts'

export function HexDetail() {
  const params = useParams()
  const id = Number(params.id)
  const hex = Number.isInteger(id) && id >= 1 && id <= 64 ? hexById(id) : null

  if (!hex) {
    return (
      <article className="page">
        <h1>冇呢一卦</h1>
        <Link to="/hexagrams">返回卦辭</Link>
      </article>
    )
  }

  const bianKeys = YAO_KEYS

  return (
    <article className="page">
      <p>
        <Link to="/hexagrams">返回卦辭</Link>
      </p>
      <header className="day-head">
        <HexLines lines={hex.lines} />
        <div>
          <h1>
            <span className="symbol">{hex.symbol}</span> {hex.name}
          </h1>
          <p>
            第{hex.id}卦　上{hex.upper}　下{hex.lower}
          </p>
          <p>關鍵詞　{hex.keyword}</p>
          <p>吉凶　{hex.fortune}</p>
          <p>口訣　{hex.motto}</p>
          <p>卦象　{hex.imagePhrase}</p>
          <p className="source">站方整理。卦辭摘要唔代替《周易》經文。</p>
        </div>
      </header>
      <section>
        <h2>卦辭</h2>
        <p>{hex.judgment}</p>
        <p className="source">通行本</p>
      </section>
      <section>
        <h2>大象</h2>
        <p>{hex.greatImage}</p>
        <p className="source">通行本 · 象傳首句</p>
      </section>
      <section>
        <h2>爻辭</h2>
        <ol className="yao-list">
          {hex.yao.map((line, index) => (
            <li key={line.position}>
              <h3>{line.position}</h3>
              <p>{line.text}</p>
              <p className="source">通行本</p>
              <h3>{bianKeys[index]}白話</h3>
              <p>{hex.bianyao[bianKeys[index]] ?? '（此爻變爻未備）'}</p>
              <p className="source">站方整理 · 變爻全文</p>
            </li>
          ))}
        </ol>
        {hex.yong ? (
          <div>
            <h3>{hex.yong.position}</h3>
            <p>{hex.yong.text}</p>
            <p className="source">通行本</p>
            {hex.bianyao[hex.yong.position as '用九' | '用六'] ? (
              <>
                <h3>{hex.yong.position}白話</h3>
                <p>{hex.bianyao[hex.yong.position as '用九' | '用六']}</p>
                <p className="source">站方整理 · 變爻全文</p>
              </>
            ) : null}
          </div>
        ) : null}
      </section>
    </article>
  )
}
