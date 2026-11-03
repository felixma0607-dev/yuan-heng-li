export class LunarCastError extends Error {
  constructor(message = '農曆換算失敗，已停止起卦。') {
    super(message)
    this.name = 'LunarCastError'
  }
}

export class InputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InputError'
  }
}
