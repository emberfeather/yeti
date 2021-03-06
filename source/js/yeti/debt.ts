import { randomIntRange } from '../utility/random'
import { generateUUID } from '../utility/uuid'

export default class YetiDebt {
  private _borrowed: number
  private _rate: number
  private _minimumPayment: number
  uid: string

  constructor(borrowed: number, rate: number, minimumPayment: number) {
    this.borrowed = borrowed || 0
    this.rate = rate || 0
    this.minimumPayment = minimumPayment || 0
    this.uid = generateUUID()
  }

  static calcMinimumPayment(borrowed: number, rate: number, balanceRate: number = .01): number {
    // Minimum payment is interest + 1% of balance.
    return this.fixed(borrowed * (rate / 100 / 12) + borrowed * balanceRate)
  }

  static fixed(value: number): number {
    return parseFloat(value.toFixed(2))
  }

  static fromExport(debtInfo: any): YetiDebt {
    return new this(debtInfo.borrowed, debtInfo.rate, debtInfo.minimumPayment)
  }

  static randomDebt() {
    const borrowed = randomIntRange(500, 20000)
    const rate = randomIntRange(300, 2100)/100
    const minimumPayment = this.calcMinimumPayment(borrowed, rate)

    return new this(borrowed, rate, minimumPayment)
  }

  get borrowed():number {
    return this._borrowed
  }

  get interestOnlyPayment() {
    return YetiDebt.calcMinimumPayment(
      this.borrowed, this.rate, 0)
  }

  get minimumPayment():number {
    return this._minimumPayment
  }

  get rate():number {
    return this._rate
  }

  set borrowed(value) {
    if (value < 0) {
      throw 'Borrowed amount cannot be negative.'
    }

    this._borrowed = value

    // Auto-correct the minimum payment.
    this.minimumPayment = this.minimumPayment
  }

  set minimumPayment(value) {
    if (value < 0) {
      throw 'Minimum payment amount cannot be negative.'
    }

    const calculatedMinimumPayment: number = YetiDebt.calcMinimumPayment(
      this.borrowed, this.rate, 0)

    // Enforce minimum payment is at least paying interest.
    value = Math.max(calculatedMinimumPayment, value)

    this._minimumPayment = value
  }

  set rate(value) {
    if (value < 0) {
      throw 'Rate amount cannot be negative.'
    }

    if (value > 100) {
      throw 'Rate amount cannot exceed 100.'
    }

    this._rate = value

    // Auto-correct the minimum payment.
    this.minimumPayment = this.minimumPayment
  }

  export(): any {
    return {
      borrowed: this.borrowed,
      minimumPayment: this.minimumPayment,
      rate: this.rate,
    }
  }

  validate(): string[] {
    const errors: string[] = []

    // TODO: Validate the values are valid for a debt.

    return errors
  }
}
