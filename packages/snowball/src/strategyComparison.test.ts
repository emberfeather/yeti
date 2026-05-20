import { describe, it, expect } from "vitest"
import { YetiStrategyComparison } from "./strategyComparison"
import { BaseYetiStrategy } from "./strategy"
import { YetiDebt } from "./debt"

describe("YetiStrategyComparison", () => {
  // Simple mock strategy subclass to supply pre-defined metrics
  class MockStrategy extends BaseYetiStrategy {
    private _interest: number
    private _months: number
    private _principal: number

    constructor(
      debts: YetiDebt[],
      payment: number,
      interest: number,
      months: number,
      principal: number,
    ) {
      super(debts, payment)
      this._interest = interest
      this._months = months
      this._principal = principal
    }

    get interest(): number {
      return this._interest
    }

    get months(): number {
      return this._months
    }

    get principal(): number {
      return this._principal
    }

    get total(): number {
      return this.principal + this.interest
    }
  }

  it("should calculate correct differences between target strategy and base strategy", () => {
    const debts = [new YetiDebt(1000, 0, 50)]
    const baseStrategy = new MockStrategy(debts, 50, 100, 12, 1000)
    const targetStrategy = new MockStrategy(debts, 50, 80, 10, 1000)

    const comparison = new YetiStrategyComparison(baseStrategy, targetStrategy)

    expect(comparison.baseStrategy).toBe(baseStrategy)
    expect(comparison.strategy).toBe(targetStrategy)

    // target - base
    expect(comparison.interest).toBe(-20) // 80 - 100
    expect(comparison.months).toBe(-2) // 10 - 12
    expect(comparison.principal).toBe(0) // 1000 - 1000
    expect(comparison.total).toBe(-20) // 1080 - 1100
  })
})
