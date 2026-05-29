import { YetiDebtInfo } from "./debt"
import { YetiStrategyComparison } from "./strategyComparison"
import { YetiPaymentBudget, addExtraPayment } from "./paymentGenerator"

/**
 * Interface representing a group of debt strategies evaluated together.
 */
export interface StrategyGroupInfo {
  /** The list of debts evaluated by all strategies in the group. */
  debts: YetiDebtInfo[]
  /** The baseline monthly payment budget allocated for the strategies. */
  payment: YetiPaymentBudget
  /** The list of strategy identifiers or keys evaluated in this group. */
  strategies: string[]
}

/**
 * Orchestrates the execution of multiple debt payoff strategies simultaneously
 * on a single set of debts and monthly payment budget.
 *
 * Provides utilities to compare outcomes against a baseline strategy and
 * simulate accelerated payoff structures with extra monthly funds.
 */
export class StrategyGroup implements StrategyGroupInfo {
  /** The key of the baseline strategy used for comparison (e.g. "minimumPayment"). */
  baseStrategyKey: string
  /** The list of debts evaluated by all strategies. */
  debts: YetiDebtInfo[]
  /** Dictionary mapping strategy keys to their corresponding constructor classes. */
  strategyClasses: any
  /** Dictionary mapping strategy keys to their simulated strategy instances. */
  strategies: any
  /** The baseline total monthly payment budget. */
  payment: YetiPaymentBudget

  /**
   * Constructs a new StrategyGroup and automatically runs all provided strategies.
   *
   * @param strategyClasses - Object mapping keys to BaseYetiStrategy subclass constructors.
   * @param baseStrategyKey - The key of the baseline strategy.
   * @param debts - The list of debts to evaluate.
   * @param payment - The monthly payment budget.
   */
  constructor(
    strategyClasses: any,
    baseStrategyKey: string,
    debts: YetiDebtInfo[],
    payment: YetiPaymentBudget,
  ) {
    this.strategyClasses = strategyClasses
    this.baseStrategyKey = baseStrategyKey
    this.debts = debts
    this.payment = payment
    this.strategies = {}

    for (const key of Object.keys(this.strategyClasses)) {
      this.strategies[key] = new this.strategyClasses[key](
        this.debts,
        this.payment,
      )
    }
  }

  /**
   * Simulates an accelerated payoff for a specific strategy by adding extra monthly funds.
   *
   * @param strategyKey - The key of the strategy to run.
   * @param extra - The additional monthly payment amount to add to the baseline budget.
   * @returns A new strategy instance representing the accelerated simulation.
   */
  accelerate(strategyKey: string, extra: number) {
    return new this.strategyClasses[strategyKey](
      this.debts,
      addExtraPayment(this.payment, extra),
    )
  }

  /**
   * Compares a target strategy's outcome against the configured base strategy.
   *
   * @param strategyKey - The key of the target strategy to compare.
   * @returns A YetiStrategyComparison comparing the baseline strategy to the target strategy.
   */
  compare(strategyKey: string) {
    return new YetiStrategyComparison(
      this.strategies[this.baseStrategyKey],
      this.strategies[strategyKey],
    )
  }
}
