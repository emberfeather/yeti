import { YetiDebtInfo } from "./debt";
import { YetiSchedule, YetiScheduleInfo } from "./schedule";
import { toMoney } from "./utility/numbers";
import { YetiPaymentBudget, getPaymentForMonth } from "./paymentGenerator";

/**
 * Interface describing the structure of a debt payoff simulation strategy.
 */
export interface YetiStrategyInfo {
  /** The unique key identifying this strategy (e.g. "lowestBalance", "highestRate"). */
  key: string;
  /** The list of debts evaluated by this strategy. */
  debts: YetiDebtInfo[];
  /** The total monthly payment budget allocated for all debts. */
  payment: YetiPaymentBudget;
  /** The generated payment schedules for each debt. */
  schedules: YetiScheduleInfo[];
}

/**
 * Abstract-like base class for executing debt repayment simulation strategies.
 * Provides the core simulation engine and can be extended to implement custom debt ordering.
 */
export class BaseYetiStrategy implements YetiStrategyInfo {
  /** The list of debts, sorted according to the strategy's sorting criteria. */
  debts: YetiDebtInfo[];
  /** The unique key of the strategy. */
  key: string = "unknown";
  /** The total monthly budget (minimum payments + extra payment capacity). */
  payment: YetiPaymentBudget;
  /** Amortization schedules for each debt. */
  schedules: YetiScheduleInfo[];

  /**
   * Constructs and runs the strategy simulation.
   *
   * @param debts - List of debts to simulate.
   * @param payment - Total monthly payment budget.
   */
  constructor(debts: YetiDebtInfo[], payment: YetiPaymentBudget) {
    this.debts = debts.sort(this.sortDebts);
    this.payment = payment;
    this.schedules = [];

    for (const debt of this.debts) {
      this.schedules.push(new YetiSchedule(debt));
    }

    this.runStrategy();
  }

  /**
   * Returns the cumulative interest paid across all schedules.
   */
  get interest(): number {
    let interest = 0;
    for (const schedule of this.schedules) {
      interest += schedule.interest;
    }
    return toMoney(interest);
  }

  /**
   * Returns the maximum duration (in months) required to pay off all debts.
   */
  get months(): number {
    let maxMonths = 0;
    for (const schedule of this.schedules) {
      maxMonths = Math.max(maxMonths, schedule.months);
    }
    return maxMonths;
  }

  /**
   * Returns the cumulative principal paid across all schedules.
   */
  get principal(): number {
    let principal = 0;
    for (const schedule of this.schedules) {
      principal += schedule.principal;
    }
    return toMoney(principal);
  }

  /**
   * Returns the total cost of repayment (principal + interest).
   */
  get total(): number {
    return toMoney(this.principal + this.interest);
  }

  /**
   * Calculates the extra payment budget available for the month.
   * Can be overridden by strategies (like MinimumPayment) that ignore extra payment budgets.
   *
   * @param extra - The computed difference between total budget and active minimum payments.
   * @returns The extra payment amount to allocate.
   */
  extraPayment(extra: number) {
    return extra;
  }

  /**
   * Runs the simulation engine loop month-by-month.
   *
   * In each simulated month:
   * 1. It sums the minimum payments of all active (unpaid) debts.
   * 2. It calculates the extra budget (`total payment - sum(minimum payments)`).
   * 3. It applies payments to debts sequentially (in sorted order). Any rollover funds from
   *    repaid debts are carried forward to the next unpaid debt in the list.
   * 4. The simulation ends when all debts are paid off or when the safety threshold (1,000 months) is hit.
   */
  runStrategy() {
    let remainingExtra = 0;
    let tripWire = 0;
    let isAllPaidOff = false;

    while (!isAllPaidOff && tripWire++ < 1000) {
      let minimumPayments = 0;

      for (const schedule of this.schedules) {
        if (schedule.isPaidOff) {
          continue;
        }

        minimumPayments += schedule.debt.minimumPayment;
      }

      const monthlyPayment = getPaymentForMonth(this.payment, tripWire);
      remainingExtra = this.extraPayment(toMoney(monthlyPayment - minimumPayments));
      isAllPaidOff = true;

      for (const schedule of this.schedules) {
        if (schedule.isPaidOff) {
          continue;
        }

        remainingExtra = schedule.payment(remainingExtra);

        if (!schedule.isPaidOff) {
          isAllPaidOff = false;
        }
      }
    }
  }

  /**
   * Comparator method used to sort debts before simulating.
   * Defaults to keeping the original order. Subclasses must override this to enforce a sorting strategy.
   *
   * @param _firstDebt - The first debt to compare.
   * @param _secondDebt - The second debt to compare.
   * @returns A comparison value mapping to standard array sort.
   */
  sortDebts(_firstDebt: YetiDebtInfo, _secondDebt: YetiDebtInfo): number {
    // Default to no sort.
    return 0;
  }
}

/**
 * Strategy: Minimum Payment Only.
 *
 * Simulates debt repayment using only the required minimum monthly payment for each debt.
 * Excess monthly budget is ignored.
 */
export class MinimumPaymentYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebtInfo[], payment: YetiPaymentBudget) {
    super(debts, payment);
    this.key = "minimumPayment";
  }

  /**
   * Minimum payment strategy does not utilize extra funds.
   */
  extraPayment(_extra: number) {
    return 0;
  }
}

/**
 * Strategy: Balance-to-Payment Ratio.
 *
 * Sorts debts by the ratio of outstanding balance to minimum payment (`borrowed / minimumPayment`) in ascending order.
 * Tie-breaker: lowest balance first.
 */
export class BalancePaymentRatioYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebtInfo[], payment: YetiPaymentBudget) {
    super(debts, payment);
    this.key = "balancePaymentRatio";
  }

  sortDebts(firstDebt: YetiDebtInfo, secondDebt: YetiDebtInfo): number {
    const ratio =
      firstDebt.borrowed / firstDebt.minimumPayment -
      secondDebt.borrowed / secondDebt.minimumPayment;

    // If they have the same ratio, want the one with the lowest balance first
    if (ratio === 0) {
      return firstDebt.borrowed - secondDebt.borrowed;
    }

    return ratio;
  }
}

/**
 * Strategy: Balance-to-Rate Ratio.
 *
 * Sorts debts by the ratio of outstanding balance to interest rate (`borrowed / rate`) in ascending order.
 * Tie-breaker: lowest balance first.
 */
export class BalanceRateRatioYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebtInfo[], payment: YetiPaymentBudget) {
    super(debts, payment);
    this.key = "balanceRateRatio";
  }

  sortDebts(firstDebt: YetiDebtInfo, secondDebt: YetiDebtInfo): number {
    const ratio = firstDebt.borrowed / firstDebt.rate - secondDebt.borrowed / secondDebt.rate;

    // If they have the same ratio, want the one with the lowest balance first
    if (ratio === 0) {
      return firstDebt.borrowed - secondDebt.borrowed;
    }

    return ratio;
  }
}

/**
 * Strategy: Highest Balance First.
 *
 * Prioritizes paying off debts with the largest outstanding balance first.
 * Tie-breaker: highest interest rate first.
 */
export class HighestBalanceYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebtInfo[], payment: YetiPaymentBudget) {
    super(debts, payment);
    this.key = "highestBalance";
  }

  sortDebts(firstDebt: YetiDebtInfo, secondDebt: YetiDebtInfo): number {
    const diff = secondDebt.borrowed - firstDebt.borrowed;

    // If they have the same interest rate, want the one with the lowest balance first
    if (diff === 0) {
      return secondDebt.rate - firstDebt.rate;
    }

    return diff;
  }
}

/**
 * Strategy: Debt Avalanche (Highest Rate First).
 *
 * Prioritizes paying off debts with the highest annual interest rate first.
 * This is mathematically optimal for minimizing total interest paid.
 * Tie-breaker: lowest balance first.
 */
export class HighestRateYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebtInfo[], payment: YetiPaymentBudget) {
    super(debts, payment);
    this.key = "highestRate";
  }

  sortDebts(firstDebt: YetiDebtInfo, secondDebt: YetiDebtInfo): number {
    const diff = secondDebt.rate - firstDebt.rate;

    // If they have the same interest rate, want the one with the lowest balance first
    if (diff === 0) {
      return firstDebt.borrowed - secondDebt.borrowed;
    }

    return diff;
  }
}

/**
 * Strategy: Debt Snowball (Lowest Balance First).
 *
 * Prioritizes paying off debts with the smallest outstanding balance first.
 * This provides psychological wins early by clearing individual accounts quickly.
 * Tie-breaker: highest interest rate first.
 */
export class LowestBalanceYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebtInfo[], payment: YetiPaymentBudget) {
    super(debts, payment);
    this.key = "lowestBalance";
  }

  sortDebts(firstDebt: YetiDebtInfo, secondDebt: YetiDebtInfo): number {
    var diff = firstDebt.borrowed - secondDebt.borrowed;

    // If they have the same interest rate, want the one with the lowest rate first
    if (diff === 0) {
      return secondDebt.rate - firstDebt.rate;
    }

    return diff;
  }
}

/**
 * Strategy: Lowest Rate First.
 *
 * Prioritizes paying off debts with the lowest interest rate first.
 * Tie-breaker: lowest balance first.
 */
export class LowestRateYetiStrategy extends BaseYetiStrategy {
  constructor(debts: YetiDebtInfo[], payment: YetiPaymentBudget) {
    super(debts, payment);
    this.key = "lowestRate";
  }

  sortDebts(firstDebt: YetiDebtInfo, secondDebt: YetiDebtInfo): number {
    const diff = firstDebt.rate - secondDebt.rate;

    // If they have the same interest rate, want the one with the lowest balance first
    if (diff === 0) {
      return firstDebt.borrowed - secondDebt.borrowed;
    }

    return diff;
  }
}

/**
 * Mapping registry of all built-in strategy classes by their identifier keys.
 */
export const strategies = {
  /** Simulation using minimum payments only. */
  minimumPayment: MinimumPaymentYetiStrategy,
  /** Simulation sorting by balance/payment ratio. */
  balancePaymentRatio: BalancePaymentRatioYetiStrategy,
  /** Simulation sorting by balance/rate ratio. */
  balanceRateRatio: BalanceRateRatioYetiStrategy,
  /** Simulation prioritizing highest balance first. */
  highestBalance: HighestBalanceYetiStrategy,
  /** Simulation prioritizing highest rate first (Avalanche). */
  highestRate: HighestRateYetiStrategy,
  /** Simulation prioritizing lowest balance first (Snowball). */
  lowestBalance: LowestBalanceYetiStrategy,
  /** Simulation prioritizing lowest rate first. */
  lowestRate: LowestRateYetiStrategy,
};
