import YetiDebt from './debt'

export default class StrategyGroup {
  baseStrategyKey: string
  debts: YetiDebt[]
  strategyClasses: any
  strategies: any
  payment: number

  constructor(strategyClasses: any, baseStrategyKey: string, debts: YetiDebt[], payment: number) {
    this.strategyClasses = strategyClasses
    this.baseStrategyKey = baseStrategyKey
    this.debts = debts
    this.payment = payment
    this.strategies = {}

    for (const key of Object.keys(this.strategyClasses)) {
      this.strategies[key] = new this.strategyClasses[key](this.debts, this.payment)
    }
  }
}
