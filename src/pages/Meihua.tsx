import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CastResult } from '../components/CastResult.tsx'
import { DateFields } from '../components/DateFields.tsx'
import { HexLines } from '../components/HexLines.tsx'
import { hktNow, loadAlmanac, SHICHEN, shichenIndexForHour } from '../lib/almanac.ts'
import { hexById } from '../lib/catalog.ts'
import { YAO_KEYS } from '../lib/copy.ts'
import { InputError } from '../lib/errors.ts'
import { findRecentMeihua, normQuestion, saveMeihua, type StoredMeihua } from '../lib/storage.ts'
import type { Ymd } from '../lib/types.ts'
import {
  bodyUse,
  changedOf,
  eightFormula,
  hexFromTrigrams,
  mutualOf,
  numberFormula,
  timeFormula,
} from '../lib/yijing.ts'

export function Meihua() {
  const now = hktNow()
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState<'time' | 'number'>('time')
  const [ymd, setYmd] = useState<Ymd>({ year: now.year, month: now.month, day: now.day })
  const [shichen, setShichen] = useState(shichenIndexForHour(now.hour))
  const [first, setFirst] = useState('')
  const [second, setSecond] = useState('')
  const [compareOn, setCompareOn] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<StoredMeihua | null>(null)
  const [recent, setRecent] = useState<StoredMeihua | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (recent && !dialog.open) dialog.showModal()
    if (!recent && dialog.open) dialog.close()
  }, [recent])

  useEffect(() => {
    if (!result) return
    resultRef.current?.scrollIntoView({ block: 'start' })
  }, [result])

  function buildCast(): StoredMeihua {
    const norm = normQuestion(question)
    if (!norm) throw new InputError('請先寫低想問的一件事。')

    if (mode === 'number') {
      const a = Number(first)
      const b = Number(second)
      const numbered = numberFormula(a, b)
      const today = hktNow()
      const almanac = loadAlmanac(today.year, today.month, today.day, 12, 0)
      const primary = numbered.hex
      const mutual = mutualOf(primary)
      const changed = changedOf(primary, [numbered.cast.moving])
      const usage = bodyUse(primary, almanac.monthZhi)
      return {
        at: Date.now(),
        question: question.trim(),
        norm,
        mode,
        primaryId: primary.id,
        mutualId: mutual.id,
        changedId: changed.id,
        moving: [numbered.cast.moving],
        formula: [
          ...numbered.lines,
          `月令用香港當日正午的月建${almanac.monthZhi}。`,
        ],
        monthZhi: almanac.monthZhi,
        bodyName: usage.body.name,
        bodyElement: usage.body.element,
        bodyPhase: usage.body.phase,
        useName: usage.use.name,
        useElement: usage.use.element,
        usePhase: usage.use.phase,
        relation: usage.relation,
        compareLines: compareOn ? eightFormula(a, b).lines : null,
      }
    }

    const slot = SHICHEN[shichen]
    const almanac = loadAlmanac(ymd.year, ymd.month, ymd.day, slot.hour, 0)
    if (almanac.hourZhi !== slot.name) {
      throw new InputError('所選時辰與曆法庫不一致，已停止起卦。')
    }
    const timed = timeFormula({
      yearZhi: almanac.yearZhi,
      yearZhiNum: almanac.yearZhiNum,
      lunarMonth: almanac.lunarMonth,
      lunarDay: almanac.lunarDay,
      hourZhi: almanac.hourZhi,
      hourZhiNum: almanac.hourZhiNum,
      leap: almanac.leap,
    })
    const primary = hexFromTrigrams(timed.cast.lower, timed.cast.upper)
    const mutual = mutualOf(primary)
    const changed = changedOf(primary, [timed.cast.moving])
    const usage = bodyUse(primary, almanac.monthZhi)
    return {
      at: Date.now(),
      question: question.trim(),
      norm,
      mode,
      primaryId: primary.id,
      mutualId: mutual.id,
      changedId: changed.id,
      moving: [timed.cast.moving],
      formula: [
        `${almanac.civil}　${almanac.lunarText}${almanac.leap ? '（閏月）' : ''}　${slot.label}`,
        ...timed.lines,
      ],
      monthZhi: almanac.monthZhi,
      bodyName: usage.body.name,
      bodyElement: usage.body.element,
      bodyPhase: usage.body.phase,
      useName: usage.use.name,
      useElement: usage.use.element,
      usePhase: usage.use.phase,
      relation: usage.relation,
      compareLines: null,
    }
  }

  function onCast() {
    setError('')
    try {
      if (!normQuestion(question)) throw new InputError('請先寫低想問的一件事。')
      const found = findRecentMeihua(question)
      if (found) {
        setRecent(found)
        return
      }
      const cast = buildCast()
      saveMeihua(cast)
      setResult(cast)
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : '起卦失敗。')
    }
  }

  const primary = result ? hexById(result.primaryId) : null
  const mutual = result ? hexById(result.mutualId) : null
  const changed = result ? hexById(result.changedId) : null

  return (
    <article className="page">
      <h1>梅花起卦</h1>
      <p>一件事起一次。時間為預設，也可以改用兩個數。</p>
      <label className="stack">
        問句
        <textarea
          value={question}
          maxLength={200}
          rows={3}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="寫低一件事"
        />
      </label>
      <div className="segment" role="tablist" aria-label="起卦方式">
        <button type="button" aria-pressed={mode === 'time'} onClick={() => setMode('time')}>
          時間
        </button>
        <button type="button" aria-pressed={mode === 'number'} onClick={() => setMode('number')}>
          兩數
        </button>
      </div>
      {mode === 'time' ? (
        <div className="stack">
          <DateFields value={ymd} onChange={setYmd} />
          <label>
            時辰
            <select value={shichen} onChange={(event) => setShichen(Number(event.target.value))}>
              {SHICHEN.map((slot, index) => (
                <option key={slot.name} value={index}>
                  {slot.label}
                </option>
              ))}
            </select>
          </label>
          <p className="source">時區：香港。年支取農曆年。標準方法</p>
        </div>
      ) : (
        <div className="stack">
          <label>
            數甲（100–500）
            <input
              inputMode="numeric"
              value={first}
              onChange={(event) => setFirst(event.target.value.replace(/[^\d]/g, ''))}
              placeholder="例如 499"
            />
          </label>
          <label>
            數乙（50–100）
            <input
              inputMode="numeric"
              value={second}
              onChange={(event) => setSecond(event.target.value.replace(/[^\d]/g, ''))}
              placeholder="例如 89"
            />
          </label>
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              setFirst('499')
              setSecond('89')
            }}
          >
            填入 499／89
          </button>
          <label className="check">
            <input
              type="checkbox"
              checked={compareOn}
              onChange={(event) => setCompareOn(event.target.checked)}
            />
            兩數各÷8（僅對照）
          </label>
          <p className="source">預設：數甲÷64 定卦序，數乙÷6 定動爻。餘 0 分別作未濟、上爻。標準方法</p>
        </div>
      )}
      <p className="note">一事不二占。同一問題二十四小時內不重複起卦。</p>
      <button type="button" className="primary" onClick={onCast}>
        起卦
      </button>
      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}

      {result && primary && mutual && changed ? (
        <div ref={resultRef}>
          <CastResult
            question={result.question}
            method="梅花易數"
            primary={primary}
            changed={changed}
            moving={result.moving}
            rest={
              <>
                <p className="source">讀序：本 → 互 → 變。總斷焦點在本卦同動爻。標準方法</p>
                <p>
                  而家偏{primary.keyword}；過程{mutual.keyword}；往後傾向{changed.keyword}。
                </p>
                <p className="source">轉述整理欄</p>
                <div className="triad">
                  {(
                    [
                      { role: '本卦', hex: primary, moving: result.moving },
                      { role: '互卦', hex: mutual, moving: [] as number[] },
                      { role: '變卦', hex: changed, moving: [] as number[] },
                    ]
                  ).map((item) => (
                    <article key={item.role} className="mini">
                      <h3>
                        {item.role}　
                        <Link to={`/hexagrams/${item.hex.id}`}>{item.hex.name}</Link>
                      </h3>
                      <HexLines lines={item.hex.lines} moving={item.moving} />
                      <p>
                        上{item.hex.upper}　下{item.hex.lower}
                      </p>
                      <p>關鍵詞　{item.hex.keyword}</p>
                      <p>吉凶　{item.hex.fortune}</p>
                      <p>口訣　{item.hex.motto}</p>
                      {item.role === '本卦' ? <p>卦象　{item.hex.imagePhrase}</p> : null}
                      <p className="source">站方整理</p>
                    </article>
                  ))}
                </div>
                <h3>體用</h3>
                <p>下卦{result.bodyName}　{result.bodyElement}　體（自己）　月令{result.bodyPhase}</p>
                <p>上卦{result.useName}　{result.useElement}　用（事／對方）　月令{result.usePhase}</p>
                <p>關係　{result.relation}</p>
                <p className="source">
                  標準方法。月建{result.monthZhi}。上＝事／對方，下＝自己。
                </p>
                <h3>算式</h3>
                <ul>
                  {result.formula.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p>動{YAO_KEYS[result.moving[0] - 1]}</p>
                {result.compareLines ? (
                  <>
                    <h3>僅對照</h3>
                    <ul>
                      {result.compareLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </>
            }
          />
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        className="modal"
        onClose={() => setRecent(null)}
      >
        <h2>一事不二占</h2>
        <p>呢條問題近日已經起過。同一件事不重複占。</p>
        <button
          type="button"
          className="primary"
          onClick={() => {
            if (recent) setResult(recent)
            setRecent(null)
          }}
        >
          查看上次
        </button>
        <button type="button" className="text-btn" onClick={() => setRecent(null)}>
          返回修改
        </button>
      </dialog>
    </article>
  )
}
