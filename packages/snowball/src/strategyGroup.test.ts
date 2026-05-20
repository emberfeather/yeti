import { describe, it, expect } from "vitest"
import { StrategyGroup } from "./strategyGroup"
import { YetiDebt } from "./debt"
import { BaseYetiStrategy } from "./strategy"
import { YetiStrategyComparison } from "./strategyComparison"

describe("StrategyGroup", () => {
  // Simple mock strategy class for testing
  class MockStrategyA extends BaseYetiStrategy {
    static constructedCount = 0
    static lastPaymentArg = 0

    constructor(debts: any[], payment: number) {
      super(debts, payment)
      MockStrategyA.constructedCount++
      MockStrategyA.lastPaymentArg = payment
      this.key = "strategyA"
    }
  }

  class MockStrategyB extends BaseYetiStrategy {
    constructor(debts: any[], payment: number) {
      super(debts, payment)
      this.key = "strategyB"
    }
  }

  const strategyClasses = {
    strategyA: MockStrategyA,
    strategyB: MockStrategyB,
  }

  it("should initialize and instantiate all strategy classes", () => {
    MockStrategyA.constructedCount = 0
    const debts = [new YetiDebt(1000, 0, 50)]
    const group = new StrategyGroup(strategyClasses, "strategyA", debts, 100)

    expect(group.baseStrategyKey).toBe("strategyA")
    expect(group.debts).toBe(debts)
    expect(group.payment).toBe(100)
    expect(group.strategyClasses).toBe(strategyClasses)

    expect(MockStrategyA.constructedCount).toBe(1)
    expect(group.strategies.strategyA).toBeInstanceOf(MockStrategyA)
    expect(group.strategies.strategyB).toBeInstanceOf(MockStrategyB)
  })

  it("accelerate should construct a strategy with extra payment budget", () => {
    MockStrategyA.constructedCount = 0
    const debts = [new YetiDebt(1000, 0, 50)]
    const group = new StrategyGroup(strategyClasses, "strategyA", debts, 100)

    const accelerated = group.accelerate("strategyA", 50)

    expect(accelerated).toBeInstanceOf(MockStrategyA)
    expect(MockStrategyA.lastPaymentArg).toBe(150) // 100 + 50
  })

  it("compare should return a YetiStrategyComparison comparing the target strategy with base strategy", () => {
    const debts = [new YetiDebt(1000, 0, 50)]
    const group = new StrategyGroup(strategyClasses, "strategyA", debts, 100)

    const comparison = group.compare("strategyB")

    expect(comparison).toBeInstanceOf(YetiStrategyComparison)
    expect(comparison.baseStrategy).toBe(group.strategies.strategyA)
    expect(comparison.strategy).toBe(group.strategies.strategyB)
  })
})
