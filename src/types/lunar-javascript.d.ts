declare module 'lunar-javascript' {
  export class Solar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Solar
    getLunar(): Lunar
  }

  export class Lunar {
    toString(): string
    getMonth(): number
    getDay(): number
    getYearInGanZhi(): string
    getMonthInGanZhi(): string
    getDayInGanZhi(): string
    getTimeInGanZhi(): string
    getYearZhi(): string
    getMonthZhi(): string
    getTimeZhi(): string
    getDayYi(): string[]
    getDayJi(): string[]
    getDayChongDesc(): string
    getDaySha(): string
    getDayJiShen(): string[]
    getDayXiongSha(): string[]
    getDayXunKong(): string
    getZhiXing(): string
    getJieQi(): string
    getPrevJieQi(wholeDay?: boolean): JieQi
    getNextJieQi(wholeDay?: boolean): JieQi
  }

  export class JieQi {
    getName(): string
    getSolar(): { toYmd(): string }
  }
}
