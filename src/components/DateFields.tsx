import { daysInMonth } from '../lib/almanac.ts'
import type { Ymd } from '../lib/types.ts'

const YEARS: number[] = []
for (let year = 1901; year <= 2099; year += 1) YEARS.push(year)

export function DateFields({ value, onChange }: { value: Ymd; onChange: (next: Ymd) => void }) {
  function commit(next: Ymd) {
    const maxDay = daysInMonth(next.year, next.month)
    onChange({ ...next, day: Math.min(next.day, maxDay) })
  }

  const maxDay = daysInMonth(value.year, value.month)

  return (
    <div className="date-fields">
      <label>
        年
        <select
          value={value.year}
          onChange={(event) => commit({ ...value, year: Number(event.target.value) })}
        >
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}年
            </option>
          ))}
        </select>
      </label>
      <label>
        月
        <select
          value={value.month}
          onChange={(event) => commit({ ...value, month: Number(event.target.value) })}
        >
          {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
            <option key={month} value={month}>
              {month}月
            </option>
          ))}
        </select>
      </label>
      <label>
        日
        <select
          value={Math.min(value.day, maxDay)}
          onChange={(event) => commit({ ...value, day: Number(event.target.value) })}
        >
          {Array.from({ length: maxDay }, (_, index) => index + 1).map((day) => (
            <option key={day} value={day}>
              {day}日
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
