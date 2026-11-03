import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { hktNow, loadAlmanac } from '../lib/almanac.ts'
import { HOME_HARD } from '../lib/copy.ts'
import { hexFromTrigrams, timeFormula } from '../lib/yijing.ts'

const ENTRIES = [
  { to: '/almanac', title: '通勝／日卦', text: '今日曆日，同正午本卦。' },
  { to: '/meihua', title: '梅花', text: '時間或兩數起卦。' },
  { to: '/coins', title: '金錢六爻', text: '三錢六擲，標動爻。' },
  { to: '/hexagrams', title: '六十四卦', text: '卦辭、大象、爻辭。' },
]

export function Home() {
  const today = useMemo(() => {
    try {
      const now = hktNow()
      const almanac = loadAlmanac(now.year, now.month, now.day, 12, 0)
      const timed = timeFormula({
        yearZhi: almanac.yearZhi,
        yearZhiNum: almanac.yearZhiNum,
        lunarMonth: almanac.lunarMonth,
        lunarDay: almanac.lunarDay,
        hourZhi: almanac.hourZhi,
        hourZhiNum: almanac.hourZhiNum,
        leap: almanac.leap,
      })
      const hex = hexFromTrigrams(timed.cast.lower, timed.cast.upper)
      return { almanac, hex }
    } catch {
      return null
    }
  }, [])

  return (
    <div className="home">
      <section className="today" aria-label="今日">
        {today ? (
          <>
            <p className="today-date">
              {today.almanac.civil}
              <span>{today.almanac.lunarText}</span>
            </p>
            <div className="chip-row">
              <span className="chip-label">宜</span>
              {today.almanac.yi.slice(0, 6).map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <div className="chip-row">
              <span className="chip-label ji">忌</span>
              {today.almanac.ji.slice(0, 4).map((item) => (
                <span className="chip ji" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <Link className="day-line" to="/almanac">
              日卦　{today.hex.name}　{today.hex.keyword}
            </Link>
          </>
        ) : (
          <p className="alert" role="alert">
            今日農曆換算失敗，日卦未起。
          </p>
        )}
        <p className="hard">{HOME_HARD}</p>
      </section>
      <section className="entries" aria-label="四個工具">
        {ENTRIES.map((entry) => (
          <Link key={entry.to} to={entry.to} className="entry">
            <strong>{entry.title}</strong>
            <span>{entry.text}</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
