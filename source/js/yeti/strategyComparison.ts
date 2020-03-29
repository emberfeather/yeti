import { BaseYetiStrategy } from '../yeti/strategy'

export default class YetiStrategyComparison {
  baseStrategy: BaseYetiStrategy
  strategy: BaseYetiStrategy

  constructor(baseStrategy: BaseYetiStrategy, strategy: BaseYetiStrategy) {
    this.baseStrategy = baseStrategy
    this.strategy = strategy
  }

  get interest(): number {
    return this.strategy.interest - this.baseStrategy.interest
  }

  get months(): number {
    return this.strategy.months - this.baseStrategy.months
  }

  get principal(): number {
    return this.strategy.principal - this.baseStrategy.principal
  }

  get total(): number {
    return this.strategy.total - this.baseStrategy.total
  }
}
