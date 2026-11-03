import * as OpenCC from 'opencc-js'
import { Solar } from 'lunar-javascript'
import { LunarCastError } from './errors.ts'

const toTw = OpenCC.Converter({ from: 'cn', to: 'tw' })

const WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export type Almanac = {
  year: number
  month: number
  day: number
  hour: number
  weekday: string
  civil: string
  lunarText: string
  lunarMonth: number
  lunarDay: number
  leap: boolean
  yearZhi: string
  yearZhiNum: number
  monthZhi: string
  hourZhi: string
  hourZhiNum: number
  ganZhiYear: string
  ganZhiMonth: string
  ganZhiDay: string
  ganZhiTime: string
  yi: string[]
  ji: string[]
  chongSha: string
  jiShen: string[]
  xiongShen: string[]
  xunKong: string
  zhiXing: string
  jieqiLine: string
}

export type Shichen = {
  name: string
  num: number
  hour: number
  label: string
}

export const SHICHEN: Shichen[] = [
  { name: '子', num: 1, hour: 23, label: '子時（23時）' },
  { name: '丑', num: 2, hour: 1, label: '丑時（1時）' },
  { name: '寅', num: 3, hour: 3, label: '寅時（3時）' },
  { name: '卯', num: 4, hour: 5, label: '卯時（5時）' },
  { name: '辰', num: 5, hour: 7, label: '辰時（7時）' },
  { name: '巳', num: 6, hour: 9, label: '巳時（9時）' },
  { name: '午', num: 7, hour: 12, label: '午時（12時）' },
  { name: '未', num: 8, hour: 13, label: '未時（13時）' },
  { name: '申', num: 9, hour: 15, label: '申時（15時）' },
  { name: '酉', num: 10, hour: 17, label: '酉時（17時）' },
  { name: '戌', num: 11, hour: 19, label: '戌時（19時）' },
  { name: '亥', num: 12, hour: 21, label: '亥時（21時）' },
]

export function shichenIndexForHour(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2)
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function hktNow(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-HK', {
    timeZone: 'Asia/Hong_Kong',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  const parts = Object.fromEntries(fmt.formatToParts(date).map((part) => [part.type, part.value]))
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  }
}

function assertCivil(year: number, month: number, day: number) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new LunarCastError('日期無效，已停止起卦。')
  }
  const check = new Date(Date.UTC(year, month - 1, day))
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new LunarCastError('日期無效，已停止起卦。')
  }
}

function words(values: string[]): string[] {
  const converted = values.map((value) => toTw(value)).filter((value) => value && value !== '無')
  return converted.length > 0 ? converted : ['無']
}

function ymdToChinese(ymd: string): string {
  const [year, month, day] = ymd.split('-').map((part) => Number(part))
  return `${year}年${month}月${day}日`
}

export function loadAlmanac(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): Almanac {
  assertCivil(year, month, day)
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute)) {
    throw new LunarCastError('時辰無效，已停止起卦。')
  }

  let lunar
  try {
    lunar = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar()
    const monthRaw = lunar.getMonth()
    const dayRaw = lunar.getDay()
    if (!Number.isFinite(monthRaw) || monthRaw === 0 || !Number.isFinite(dayRaw) || dayRaw < 1) {
      throw new Error('lunar empty')
    }
  } catch (error) {
    if (error instanceof LunarCastError) throw error
    throw new LunarCastError('農曆換算失敗，已停止起卦。')
  }

  const monthRaw = lunar.getMonth()
  const leap = monthRaw < 0
  const lunarMonth = Math.abs(monthRaw)
  const lunarDay = lunar.getDay()
  const yearZhi = toTw(lunar.getYearZhi())
  const monthZhi = toTw(lunar.getMonthZhi())
  const hourZhi = toTw(lunar.getTimeZhi())
  const yearZhiNum = ZHI.indexOf(yearZhi as (typeof ZHI)[number]) + 1
  const hourZhiNum = ZHI.indexOf(hourZhi as (typeof ZHI)[number]) + 1
  if (yearZhiNum < 1 || hourZhiNum < 1) {
    throw new LunarCastError('干支換算失敗，已停止起卦。')
  }

  const chongDesc = toTw(lunar.getDayChongDesc())
  const chongMatch = chongDesc.match(/\(([^)]+)\)(.+)/)
  const chongSha = `沖${chongMatch?.[2] ?? ''}（${chongMatch?.[1] ?? ''}）煞${toTw(lunar.getDaySha())}`
  const todayTerm = toTw(lunar.getJieQi() || '')
  const previous = lunar.getPrevJieQi(true)
  const next = lunar.getNextJieQi(true)
  const jieqiLine = todayTerm
    ? `當日節氣：${todayTerm}`
    : `非交節當日。上一節氣${toTw(previous.getName())}（${ymdToChinese(previous.getSolar().toYmd())}），下一節氣${toTw(next.getName())}（${ymdToChinese(next.getSolar().toYmd())}）。`
  const xun = toTw(lunar.getDayXunKong())
  const weekday = WEEK[new Date(Date.UTC(year, month - 1, day)).getUTCDay()] ?? ''

  return {
    year,
    month,
    day,
    hour,
    weekday,
    civil: `${year}年${month}月${day}日（${weekday}）`,
    lunarText: `農曆${toTw(lunar.toString())}`,
    lunarMonth,
    lunarDay,
    leap,
    yearZhi,
    yearZhiNum,
    monthZhi,
    hourZhi,
    hourZhiNum,
    ganZhiYear: toTw(lunar.getYearInGanZhi()),
    ganZhiMonth: toTw(lunar.getMonthInGanZhi()),
    ganZhiDay: toTw(lunar.getDayInGanZhi()),
    ganZhiTime: toTw(lunar.getTimeInGanZhi()),
    yi: words(lunar.getDayYi()),
    ji: words(lunar.getDayJi()),
    chongSha,
    jiShen: words(lunar.getDayJiShen()).filter((item) => item !== '無'),
    xiongShen: words(lunar.getDayXiongSha()).filter((item) => item !== '無'),
    xunKong: xun.length === 2 ? `${xun[0]}、${xun[1]}` : xun,
    zhiXing: toTw(lunar.getZhiXing()),
    jieqiLine,
  }
}
