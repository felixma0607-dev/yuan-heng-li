import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { hktNow, loadAlmanac } from '../lib/almanac.ts'
import { DisclaimerBox } from '../components/DisclaimerBox.tsx'
import { DateFields } from '../components/DateFields.tsx'
import { HexLines } from '../components/HexLines.tsx'
import { DATE_DISCLAIMER, DAY_HEX_HARD } from '../lib/copy.ts'
import { hexFromTrigrams, timeFormula } from '../lib/yijing.ts'
import type { Ymd } from '../lib/types.ts'

export function Almanac() {
  const now = hktNow()
  const [ymd, setYmd] = useState<Ymd>({ year: now.year, month: now.month, day: now.day })

  const view = useMemo(() => {
    try {
      const almanac = loadAlmanac(ymd.year, ymd.month, ymd.day, 12, 0)
      const timed = timeFormula({
        yearZhi: almanac.yearZhi,
        yearZhiNum: almanac.yearZhiNum,
        lunarMonth: almanac.lunarMonth,
        lunarDay: almanac.lunarDay,
        hourZhi: almanac.hourZhi,
        hourZhiNum: almanac.hourZhiNum,
        leap: almanac.leap,
      })
      return {
        error: '',
        almanac,
        hex: hexFromTrigrams(timed.cast.lower, timed.cast.upper),
        formula: timed.lines,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : '農曆換算失敗，已停止起卦。',
        almanac: null,
        hex: null,
        formula: [],
      }
    }
  }, [ymd])

  return (
    <article className="page">
      <h1>通勝／日卦</h1>
      <p className="hard">{DAY_HEX_HARD}</p>
      <DateFields value={ymd} onChange={setYmd} />
      <p className="source">日卦固定用該日香港時間 12:00，只示本卦。</p>

      {view.error || !view.almanac || !view.hex ? (
        <p className="alert" role="alert">
          {view.error}
        </p>
      ) : (
        <>
          <section className="summary">
            <div className="day-head">
              <HexLines lines={view.hex.lines} />
              <div>
                <h2>
                  <Link to={`/hexagrams/${view.hex.id}`}>{view.hex.name}</Link>
                </h2>
                <p>
                  第{view.hex.id}卦　上{view.hex.upper}　下{view.hex.lower}
                </p>
                <p>關鍵詞　{view.hex.keyword}</p>
                <p>口訣　{view.hex.motto}</p>
                <p>卦象　{view.hex.imagePhrase}</p>
                <p className="source">站方整理</p>
              </div>
            </div>
            <div className="chip-row">
              <span className="chip-label">宜</span>
              {view.almanac.yi.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <div className="chip-row">
              <span className="chip-label ji">忌</span>
              {view.almanac.ji.map((item) => (
                <span className="chip ji" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </section>
          <DisclaimerBox />
          <section className="panel">
            <h2>曆日</h2>
            <dl className="facts">
              <div>
                <dt>公曆</dt>
                <dd>{view.almanac.civil}</dd>
              </div>
              <div>
                <dt>農曆</dt>
                <dd>
                  {view.almanac.lunarText}
                  {view.almanac.leap ? '（閏月）' : ''}
                </dd>
              </div>
              <div>
                <dt>干支</dt>
                <dd>
                  {view.almanac.ganZhiYear}年　{view.almanac.ganZhiMonth}月　{view.almanac.ganZhiDay}日
                </dd>
              </div>
              <div>
                <dt>節氣</dt>
                <dd>{view.almanac.jieqiLine}</dd>
              </div>
              <div>
                <dt>沖煞</dt>
                <dd>{view.almanac.chongSha}</dd>
              </div>
              <div>
                <dt>吉神</dt>
                <dd>{view.almanac.jiShen.join('、') || '無'}</dd>
              </div>
              <div>
                <dt>凶神</dt>
                <dd>{view.almanac.xiongShen.join('、') || '無'}</dd>
              </div>
              <div>
                <dt>空亡</dt>
                <dd>{view.almanac.xunKong}</dd>
              </div>
            </dl>
            <p className="source">農曆日期來源：lunar-javascript（6tail）。宜忌可能與坊間通勝不同。標準方法</p>
          </section>
          <section className="panel">
            <h2>建除</h2>
            <p>建除：{view.almanac.zhiXing}</p>
            <p className="note">{DATE_DISCLAIMER}</p>
            <p className="source">建除與日卦分開。標準方法</p>
          </section>
          <details className="rest">
            <summary>日卦算式</summary>
            <p>正午時支{view.almanac.hourZhi}。年支取農曆年（正月初一換歲），不用立春年。</p>
            <ul>
              {view.formula.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="source">標準方法。日卦只取本卦，互卦同變卦不在此頁展示。要問事請去梅花。</p>
          </details>
        </>
      )}
    </article>
  )
}
