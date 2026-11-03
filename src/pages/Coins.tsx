import { useState } from 'react'
import { CastResult } from '../components/CastResult.tsx'
import { hktNow, loadAlmanac } from '../lib/almanac.ts'
import { hexByLines } from '../lib/catalog.ts'
import { YAO_KEYS } from '../lib/copy.ts'
import { coinBit, COIN_FACES, fromBacks, tossBacks, type CoinFace } from '../lib/coins.ts'
import { prepareQuestion } from '../lib/storage.ts'
import { bodyUse, changedOf, mutualOf } from '../lib/yijing.ts'

const LINE_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

export function Coins() {
  const [question, setQuestion] = useState('')
  const [faces, setFaces] = useState<(CoinFace | null)[]>([null, null, null, null, null, null])
  const [showBody, setShowBody] = useState(false)
  const [bodyError, setBodyError] = useState('')
  const [body, setBody] = useState<ReturnType<typeof bodyUse> | null>(null)
  const [cast, setCast] = useState<{
    question: string
    lines: number[]
    moving: number[]
    monthZhi: string
  } | null>(null)

  const filled = faces.filter((face) => face !== null).length
  const primary = cast ? hexByLines(cast.lines) : null
  const changed = primary && cast ? (cast.moving.length ? changedOf(primary, cast.moving) : primary) : null
  const mutual = primary ? mutualOf(primary) : null

  function setFace(index: number, backs: number) {
    setFaces((current) => current.map((face, position) => (position === index ? fromBacks(backs) : face)))
  }

  function onCast() {
    if (faces.some((face) => face === null)) return
    const ready = faces as CoinFace[]
    setCast({
      question: prepareQuestion(question).question,
      lines: ready.map((face) => coinBit(face)),
      moving: ready.flatMap((face, index) => (face.moving ? [index + 1] : [])),
      monthZhi: '',
    })
    setShowBody(false)
    setBody(null)
    setBodyError('')
  }

  function toggleBody(checked: boolean) {
    setShowBody(checked)
    setBodyError('')
    setBody(null)
    if (!checked || !primary) return
    try {
      const now = hktNow()
      const almanac = loadAlmanac(now.year, now.month, now.day, 12, 0)
      setBody(bodyUse(primary, almanac.monthZhi))
    } catch (caught) {
      setBodyError(caught instanceof Error ? caught.message : '月令換算失敗，體用未顯示。')
    }
  }

  return (
    <article className="page">
      <h1>金錢六爻</h1>
      <p>金錢六爻為三錢六擲，由下而上。娛樂參考，唔係梅花起卦。</p>
      <p className="note">
        本站寫死：背計三、字計二。三背＝九、老陽、動（●）。兩背一字＝八、少陰、靜。一背兩字＝七、少陽、靜。三字＝六、老陰、動（○）。
      </p>
      <label className="stack">
        <span>
          問句<span className="note">　可留空</span>
        </span>
        <textarea
          value={question}
          maxLength={200}
          rows={3}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="想記低先寫"
        />
      </label>
      <p className="progress" aria-live="polite">
        已定 {filled}/6
      </p>
      <div className="coin-board">
        {[5, 4, 3, 2, 1, 0].map((index) => {
          const face = faces[index]
          return (
            <div className="coin-row" key={LINE_NAMES[index]}>
              <div className="coin-name">
                {LINE_NAMES[index]}
                {face ? `　${face.name}${face.mark}` : ''}
              </div>
              <div className="value-btns">
                {COIN_FACES.map((option) => (
                  <button
                    key={option.backs}
                    type="button"
                    aria-pressed={face?.backs === option.backs}
                    onClick={() => setFace(index, option.backs)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="actions">
        <button
          type="button"
          onClick={() => {
            setFaces(Array.from({ length: 6 }, () => fromBacks(tossBacks())))
          }}
        >
          虛擬擲滿六爻
        </button>
        <button
          type="button"
          className="text-btn"
          onClick={() => setFaces([null, null, null, null, null, null])}
        >
          清空
        </button>
      </div>
      <button type="button" className="primary" disabled={filled < 6} onClick={onCast}>
        起卦
      </button>
      {cast && primary && changed && mutual ? (
        <CastResult
          question={cast.question}
          method="金錢六爻"
          primary={primary}
          changed={changed}
          moving={cast.moving}
          rest={
            <>
              <p>
                動爻：
                {cast.moving.length
                  ? cast.moving.map((index) => YAO_KEYS[index - 1]).join('、')
                  : '無'}
                {cast.moving.length > 1 ? '。多動，各動爻皆變。' : ''}
              </p>
              <h3>本卦卦辭</h3>
              <p>{primary.judgment}</p>
              <h3>大象</h3>
              <p>{primary.greatImage}</p>
              <p className="source">通行本</p>
              <p>
                關鍵詞　{primary.keyword}　吉凶　{primary.fortune}
              </p>
              <p>口訣　{primary.motto}</p>
              <p>卦象　{primary.imagePhrase}</p>
              <p className="source">站方整理</p>
              <h3>互卦</h3>
              <p>
                {mutual.name}　上{mutual.upper}　下{mutual.lower}
              </p>
              <p className="source">互卦取自六爻本卦二至五爻。標準方法</p>
              <label className="check">
                <input
                  type="checkbox"
                  checked={showBody}
                  onChange={(event) => toggleBody(event.target.checked)}
                />
                選用：以梅花體用看本卦
              </label>
              {showBody && body ? (
                <>
                  <p>下卦{body.body.name}　{body.body.element}　體（自己）　月令{body.body.phase}</p>
                  <p>上卦{body.use.name}　{body.use.element}　用（事／對方）　月令{body.use.phase}</p>
                  <p>關係　{body.relation}</p>
                  <p className="source">體用為梅花常用讀法，套用在金錢本卦時僅供參考。月建{body.monthZhi}。</p>
                </>
              ) : null}
              {showBody && bodyError ? (
                <p className="alert" role="alert">
                  {bodyError}
                </p>
              ) : null}
            </>
          }
        />
      ) : null}
    </article>
  )
}
