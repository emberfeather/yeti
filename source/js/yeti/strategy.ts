import YetiDebt from './debt'
import YetiSchedule from './schedule'
import { toMoney } from '../utility/money'

export class BaseYetiStrategy {
  debts: YetiDebt[]
  key: string
  payment: number
  schedules: YetiSchedule[]

  constructor(debts: YetiDebt[], payment: number) {
    this.debts = debts.sort(this.sortDebts)
    this.payment = payment
    this.schedules = []

    for (const debt of this.debts) {
      this.schedules.push(new YetiSchedule(debt))
    }

    this.runStrategy()
  }

  get interest(): number {
    let interest = 0
    for (const schedule of this.schedules) {
      interest += schedule.interest
    }
    return toMoney(interest)
  }

  get months(): number {
    let maxMonths = 0
    for (const schedule of this.schedules) {
      maxMonths = Math.max(maxMonths, schedule.months)
    }
    return maxMonths
  }

  get principal(): number {
    let principal = 0
    for (const schedule of this.schedules) {
      principal += schedule.principal
    }
    return toMoney(principal)
  }

  get total(): number {
    return toMoney(this.principal + this.interest)
  }

  extraPayment(extra: number) {
    return extra
  }

  runStrategy() {
    let remainingExtra = 0
    let tripWire = 0
    let isAllPaidOff = false

    while(!isAllPaidOff && tripWire++ < 1000) {
      let minimumPayments = 0

      for (const schedule of this.schedules) {
        if (schedule.isPaidOff) {
          continue
        }

        minimumPayments += schedule.debt.minimumPayment
      }

      remainingExtra = this.extraPayment(toMoney(this.payment - minimumPayments))
      isAllPaidOff = true

      for (const schedule of this.schedules) {
        if (schedule.isPaidOff) {
          continue
        }

        remainingExtra = schedule.payment(remainingExtra)

        if (!schedule.isPaidOff) {
          isAllPaidOff = false
        }
      }
    }
  }

  sortDebts(_firstDebt: YetiDebt, _secondDebt: YetiDebt): number {
    // Default to no sort.
    return 0
  }
}

export class MinimumPaymentYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebt[], payment: number) {
    super(debts, payment)
    this.key = 'minimumPayment'
  }

  // Minimum payment does not use extra funds.
  extraPayment(_extra: number) {
    return 0
  }
}

export class BalancePaymentRatioYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebt[], payment: number) {
    super(debts, payment)
    this.key = 'balancePaymentRatio'
  }

  sortDebts(firstDebt: YetiDebt, secondDebt: YetiDebt): number {
    const ratio = (firstDebt.borrowed / firstDebt.minimumPayment) - (secondDebt.borrowed / secondDebt.minimumPayment)

		// If they have the same ratio, want the one with the lowest balance first
		if(ratio === 0) {
			return firstDebt.borrowed - secondDebt.borrowed
		}

		return ratio
  }
}

export class BalanceRateRatioYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebt[], payment: number) {
    super(debts, payment)
    this.key = 'balanceRateRatio'
  }

  sortDebts(firstDebt: YetiDebt, secondDebt: YetiDebt): number {
    const ratio = (firstDebt.borrowed / firstDebt.rate) - (secondDebt.borrowed / secondDebt.rate)

		// If they have the same ratio, want the one with the lowest balance first
		if(ratio === 0) {
			return firstDebt.borrowed - secondDebt.borrowed
		}

		return ratio
  }
}

export class HighestBalanceYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebt[], payment: number) {
    super(debts, payment)
    this.key = 'highestBalance'
  }

  sortDebts(firstDebt: YetiDebt, secondDebt: YetiDebt): number {
    const diff = secondDebt.borrowed - firstDebt.borrowed

    // If they have the same interest rate, want the one with the lowest balance first
    if(diff === 0) {
      return secondDebt.rate - firstDebt.rate
    }

    return diff
  }
}

export class HighestRateYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebt[], payment: number) {
    super(debts, payment)
    this.key = 'highestRate'
  }

  sortDebts(firstDebt: YetiDebt, secondDebt: YetiDebt): number {
    const diff = secondDebt.rate - firstDebt.rate

		// If they have the same interest rate, want the one with the lowest balance first
		if(diff === 0) {
			return firstDebt.borrowed - secondDebt.borrowed
		}

		return diff
  }
}

export class LowestBalanceYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebt[], payment: number) {
    super(debts, payment)
    this.key = 'lowestBalance'
  }

  sortDebts(firstDebt: YetiDebt, secondDebt: YetiDebt): number {
    var diff = firstDebt.borrowed - secondDebt.borrowed

		// If they have the same interest rate, want the one with the lowest rate first
		if(diff === 0) {
			return secondDebt.rate - firstDebt.rate
		}

		return diff
  }
}

export class LowestRateYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebt[], payment: number) {
    super(debts, payment)
    this.key = 'lowestRate'
  }

  sortDebts(firstDebt: YetiDebt, secondDebt: YetiDebt): number {
    const diff = firstDebt.rate - secondDebt.rate

		// If they have the same interest rate, want the one with the lowest balance first
		if(diff === 0) {
			return firstDebt.borrowed - secondDebt.borrowed
		}

		return diff
  }
}

export const strategies = {
  'minimumPayment': MinimumPaymentYetiStrategy,
  'balancePaymentRatio': BalancePaymentRatioYetiStrategy,
  'balanceRateRatio': BalanceRateRatioYetiStrategy,
  'highestBalance': HighestBalanceYetiStrategy,
  'highestRate': HighestRateYetiStrategy,
  'lowestBalance': LowestBalanceYetiStrategy,
  'lowestRate': LowestRateYetiStrategy,
}
