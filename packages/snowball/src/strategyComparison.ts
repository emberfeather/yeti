import { BaseYetiStrategy } from "./strategy";

/**
 * Interface representing the comparison metrics between a base strategy and a target strategy.
 * Values indicate the target strategy's metrics minus the base strategy's metrics
 * (negative values indicate savings/reductions).
 */
export interface YetiStrategyComparisonInfo {
  /** The base strategy used for comparison (e.g. minimum payment or snowball). */
  baseStrategy: BaseYetiStrategy;
  /** The target strategy being evaluated. */
  strategy: BaseYetiStrategy;
  /** Interest difference (target interest - base interest). Negative means interest saved. */
  interest: number;
  /** Duration difference in months. Negative means time saved. */
  months: number;
  /** Principal difference. Typically 0 unless the simulation failed to pay off in time. */
  principal: number;
  /** Total cost difference (target total - base total). Negative means total money saved. */
  total: number;
}

/**
 * Calculates and exposes comparison metrics between two debt payoff strategies.
 * Provides getters to easily determine how much time and money are saved under one strategy versus another.
 */
export class YetiStrategyComparison implements YetiStrategyComparisonInfo {
  /** The baseline strategy instance. */
  baseStrategy: BaseYetiStrategy;
  /** The target strategy instance. */
  strategy: BaseYetiStrategy;

  /**
   * Constructs a new comparison helper between two strategies.
   *
   * @param baseStrategy - The baseline strategy.
   * @param strategy - The strategy to compare against the baseline.
   */
  constructor(baseStrategy: BaseYetiStrategy, strategy: BaseYetiStrategy) {
    this.baseStrategy = baseStrategy;
    this.strategy = strategy;
  }

  /**
   * Difference in cumulative interest paid (target - base).
   */
  get interest(): number {
    return this.strategy.interest - this.baseStrategy.interest;
  }

  /**
   * Difference in total months to pay off (target - base).
   */
  get months(): number {
    return this.strategy.months - this.baseStrategy.months;
  }

  /**
   * Difference in principal paid (target - base).
   */
  get principal(): number {
    return this.strategy.principal - this.baseStrategy.principal;
  }

  /**
   * Difference in total cost paid (target - base).
   */
  get total(): number {
    return this.strategy.total - this.baseStrategy.total;
  }
}
