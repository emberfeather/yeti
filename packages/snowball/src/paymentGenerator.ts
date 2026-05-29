import { toMoney } from "./utility/numbers";

export type PaymentFunction = (month: number) => number;

export interface YetiPaymentGenerator {
  /**
   * Generates the payment amount for the current step (month).
   */
  getPayment: PaymentFunction;
}

export type YetiPaymentBudget = number | YetiPaymentGenerator | PaymentFunction;

/**
 * Helper to extract the monthly payment from a YetiPaymentBudget.
 *
 * @param payment - The payment budget configuration.
 * @param month - The 1-based index of the current month.
 * @returns The payment amount for the month.
 */
export function getPaymentForMonth(payment: YetiPaymentBudget, month: number): number {
  if (typeof payment === "number") {
    return payment;
  }

  if (typeof payment === "function") {
    return payment(month);
  }

  if (payment && typeof payment === "object" && typeof payment.getPayment === "function") {
    return payment.getPayment(month);
  }

  throw new Error("Invalid payment budget type");
}

/**
 * Helper to add an extra payment amount to an existing YetiPaymentBudget, returning a new budget.
 *
 * @param payment - The base payment budget.
 * @param extra - The extra amount to add.
 * @returns A new YetiPaymentBudget that includes the extra amount.
 */
export function addExtraPayment(payment: YetiPaymentBudget, extra: number): YetiPaymentBudget {
  if (typeof payment === "number") {
    return payment + extra;
  }

  if (typeof payment === "function") {
    return (month: number) => payment(month) + extra;
  }

  if (payment && typeof payment === "object" && typeof payment.getPayment === "function") {
    return {
      getPayment: (month: number) => payment.getPayment(month) + extra,
    };
  }

  throw new Error("Invalid payment budget type");
}

/**
 * A payment generator that cycles through a set of payment amounts and repeats
 * through the list until the debt is paid off.
 */
export class RepeatingPaymentGenerator implements YetiPaymentGenerator {
  constructor(public payments: number[]) {
    if (!payments || payments.length === 0) {
      throw new Error("Payments array must contain at least one payment amount.");
    }
  }

  getPayment(month: number): number {
    const index = (month - 1) % this.payments.length;
    return this.payments[index];
  }
}

/**
 * A payment generator that increases the payment amount by a flat amount or percentage
 * at a given interval (e.g., every 12 months for a yearly raise).
 */
export class GrowingPaymentGenerator implements YetiPaymentGenerator {
  constructor(
    public initialPayment: number,
    public increaseAmount: number = 0,
    public increaseRate: number = 0,
    public interval: number = 12,
  ) {
    if (initialPayment < 0) {
      throw new Error("Initial payment cannot be negative.");
    }
    if (interval <= 0) {
      throw new Error("Interval must be greater than 0.");
    }
  }

  getPayment(month: number): number {
    const periods = Math.floor((month - 1) / this.interval);
    let payment = this.initialPayment;

    if (this.increaseRate > 0) {
      payment = payment * Math.pow(1 + this.increaseRate, periods);
    }

    payment += this.increaseAmount * periods;
    return toMoney(payment);
  }
}
