import type { YetiDebtInfo } from "./debt";
import { YetiPayment, YetiPaymentInfo } from "./payment";
import { toMoney } from "./utility/numbers";

/**
 * Interface representing the schedule state of a single debt during amortization.
 */
export interface YetiScheduleInfo {
  /** The configuration metadata of the debt being amortized. */
  debt: YetiDebtInfo;
  /** The remaining balance of the debt. */
  balance: number;
  /** Historical list of payments made toward the debt. */
  payments: YetiPaymentInfo[];
  /**
   * Applies a monthly payment to the debt, updating the schedule state.
   *
   * @param extraPayment - Additional funds allocated beyond the minimum payment.
   * @returns Any excess payment amount (rollover) if the debt is paid off.
   */
  payment: (extraPayment: number) => number;
  /** The sum of all principal payments made so far. */
  principal: number;
  /** The sum of all interest payments made so far. */
  interest: number;
  /** The total number of months the debt has been active/paying. */
  months: number;
  /** Flag showing if the debt has been fully paid off. */
  isPaidOff: boolean;
}

/**
 * Tracks the amortization schedule, cumulative payments, monthly interest accrual,
 * and rollover computations for an individual debt.
 */
export class YetiSchedule implements YetiScheduleInfo {
  /** The remaining outstanding balance of the debt. */
  balance: number;
  /** The core details of the debt contract. */
  debt: YetiDebtInfo;
  /** The history of monthly payment breakdowns. */
  payments: YetiPaymentInfo[];

  /**
   * Constructs a new YetiSchedule tracker for a debt.
   *
   * @param debt - The debt metadata info.
   */
  constructor(debt: YetiDebtInfo) {
    this.debt = debt;
    this.payments = [];

    this.balance = this.debt.borrowed;
  }

  /**
   * Returns the cumulative interest paid over all payment periods, rounded to 2 decimal places.
   */
  get interest(): number {
    let interest = 0;
    for (const payment of this.payments) {
      interest += payment.interest;
    }
    return toMoney(interest);
  }

  /**
   * Checks if the debt has been paid off.
   * A debt is considered paid off if the outstanding balance is <= 0.01 (penny threshold).
   */
  get isPaidOff(): boolean {
    return this.balance <= 0.01;
  }

  /**
   * Returns the number of payment periods (months) in the schedule.
   */
  get months(): number {
    return this.payments.length;
  }

  /**
   * Returns the cumulative principal paid over all payment periods, rounded to 2 decimal places.
   */
  get principal(): number {
    let principal = 0;
    for (const payment of this.payments) {
      principal += payment.principal;
    }
    return toMoney(principal);
  }

  /**
   * Simulates a monthly payment iteration.
   * Calculates the interest accrued for the month, allocates the payment towards
   * interest first, then reduces the balance by the remaining payment amount.
   * If the payment exceeds the outstanding balance, the remainder is returned as rollover.
   *
   * @param extraPayment - Excess budget allocated to this debt for the month.
   * @returns The amount of rollover cash (overpayment) to pass to other debts.
   */
  payment(extraPayment: number): number {
    const totalPayment = this.debt.minimumPayment + extraPayment;
    const interest = toMoney(this.balance * (this.debt.rate / 100 / 12));
    let principal = toMoney(totalPayment - interest);
    this.balance = toMoney(this.balance - principal);

    // Check if there was extra paid and pass it along.
    if (this.balance < 0) {
      const extra = toMoney(this.balance * -1);
      principal = toMoney(principal - extra);
      this.balance = 0;
      this.payments.push(new YetiPayment(principal, interest));
      return extra;
    }

    this.payments.push(new YetiPayment(principal, interest));
    return 0;
  }
}
