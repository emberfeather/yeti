import YetiDebt from './debt'
import { toMoney } from '../utility/money'

export default class YetiSchedule {
  balance: number
  debt: YetiDebt
  payments: YetiPayment[]

  constructor(debt: YetiDebt) {
    this.debt = debt
    this.payments = []

    this.balance = this.debt.borrowed
  }

  get isPaidOff(): boolean {
    return this.balance <= 0.01
  }

  payment(extraPayment: number): number {
    const totalPayment = this.debt.minimumPayment + extraPayment
    const interest = toMoney(this.balance * (this.debt.rate/100/12))
    const principal = toMoney(totalPayment - interest)
    this.payments.push(new YetiPayment(principal, interest))
    this.balance = toMoney(this.balance - principal)

    // Check if there was extra paid and pass it along.
    if (this.balance < 0) {
      const extra = toMoney(this.balance * -1)
      this.balance = 0
      return extra
    }

    return 0
  }
}

export class YetiPayment {
  principal: number
  interest: number

  constructor(principal: number, interest: number) {
    this.principal = principal
    this.interest = interest
  }
}
