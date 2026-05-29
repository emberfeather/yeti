import { randomIntRange } from "./utility/numbers";

/**
 * Information describing a debt contract, including the remaining balance,
 * the monthly minimum payment, the annual interest rate, and an optional unique ID.
 */
export interface YetiDebtInfo {
  /** The remaining balance of the debt (principal). */
  borrowed: number;
  /** The required minimum monthly payment amount. */
  minimumPayment: number;
  /** The annual interest rate percentage (e.g. 15 for 15%). */
  rate: number;
  /** A unique identifier for the debt (auto-generated if not provided). */
  uid?: string;
}

/**
 * Class representing a single debt with interest calculations, validation,
 * and automatic minimum-payment enforcement.
 */
export class YetiDebt implements YetiDebtInfo {
  private _borrowed: number | undefined;
  private _rate: number | undefined;
  private _minimumPayment: number | undefined;
  /** A unique identifier (UUID) for tracking this debt in lists and UI. */
  uid: string;

  /**
   * Constructs a new YetiDebt instance.
   *
   * @param borrowed - The initial balance. Defaults to 0.
   * @param rate - The annual interest rate percentage (0-100). Defaults to 0.
   * @param minimumPayment - The initial minimum payment. Defaults to 0, but will be capped to at least interest-only.
   * @param uid - Optional unique identifier. If not provided, a random UUID will be generated.
   * @throws If borrowed, rate, or minimumPayment are negative, or if rate is greater than 100.
   */
  constructor(borrowed: number, rate: number, minimumPayment: number, uid?: string) {
    this.borrowed = borrowed || 0;
    this.rate = rate || 0;
    this.minimumPayment = minimumPayment || 0;
    this.uid = uid || crypto.randomUUID();
  }

  /**
   * Calculates the minimum payment for a debt based on its current balance and interest rate.
   *
   * Minimum payment is calculated as interest (monthly) + a percentage of the outstanding balance.
   *
   * @param borrowed - The current outstanding balance.
   * @param rate - The annual interest rate percentage.
   * @param balanceRate - The percentage of the balance to include (default is 1% / 0.01).
   * @returns The calculated minimum payment, rounded to 2 decimal places.
   */
  static calcMinimumPayment(borrowed: number, rate: number, balanceRate: number = 0.01): number {
    // Minimum payment is interest + 1% of balance.
    return this.fixed(borrowed * (rate / 100 / 12) + borrowed * balanceRate);
  }

  /**
   * Static helper utility to round numbers to 2 decimal places.
   *
   * @param value - The value to round.
   * @returns The value rounded to 2 decimal places.
   */
  static fixed(value: number): number {
    return parseFloat(value.toFixed(2));
  }

  /**
   * Creates a YetiDebt instance from a plain exported object structure.
   *
   * @param debtInfo - A plain object containing `borrowed`, `rate`, and `minimumPayment`.
   * @returns A new YetiDebt instance.
   */
  static fromExport(debtInfo: any): YetiDebt {
    return new this(debtInfo.borrowed, debtInfo.rate, debtInfo.minimumPayment);
  }

  /**
   * Generates a YetiDebt instance with randomized balance and interest rate.
   *
   * Balance is between 500 and 20,000. Rate is between 3% and 21%.
   * Minimum payment is automatically calculated.
   *
   * @returns A randomized YetiDebt instance.
   */
  static randomDebt() {
    const borrowed = randomIntRange(500, 20000);
    const rate = randomIntRange(300, 2100) / 100;
    const minimumPayment = this.calcMinimumPayment(borrowed, rate);

    return new this(borrowed, rate, minimumPayment);
  }

  /**
   * Gets the current borrowed balance of this debt.
   */
  get borrowed(): number {
    return this._borrowed ?? 0;
  }

  /**
   * Gets the interest-only payment amount for one month based on the current balance and rate.
   */
  get interestOnlyPayment() {
    return YetiDebt.calcMinimumPayment(this.borrowed, this.rate, 0);
  }

  /**
   * Gets the monthly minimum payment.
   */
  get minimumPayment(): number {
    return this._minimumPayment ?? 0;
  }

  /**
   * Gets the annual interest rate percentage.
   */
  get rate(): number {
    return this._rate ?? 0;
  }

  /**
   * Sets the outstanding borrowed balance.
   * Updates interest-only constraints and auto-corrects the minimum payment if needed.
   *
   * @param value - The new borrowed balance. Must be non-negative.
   * @throws "Borrowed amount cannot be negative." if the value is negative.
   */
  set borrowed(value) {
    if (value < 0) {
      throw "Borrowed amount cannot be negative.";
    }

    this._borrowed = value;

    // Auto-correct the minimum payment.
    this.minimumPayment = this.minimumPayment;
  }

  /**
   * Sets the monthly minimum payment.
   * Enforces that the payment is at least interest-only (so the balance doesn't increase).
   *
   * @param value - The new minimum payment. Must be non-negative.
   * @throws "Minimum payment amount cannot be negative." if the value is negative.
   */
  set minimumPayment(value) {
    if (value < 0) {
      throw "Minimum payment amount cannot be negative.";
    }

    const calculatedMinimumPayment: number = YetiDebt.calcMinimumPayment(
      this.borrowed,
      this.rate,
      0,
    );

    // Enforce minimum payment is at least paying interest.
    value = Math.max(calculatedMinimumPayment, value);

    this._minimumPayment = value;
  }

  /**
   * Sets the annual interest rate percentage.
   * Updates interest-only constraints and auto-corrects the minimum payment if needed.
   *
   * @param value - The new interest rate percentage. Must be between 0 and 100.
   * @throws "Rate amount cannot be negative." if value is < 0.
   * @throws "Rate amount cannot exceed 100." if value is > 100.
   */
  set rate(value) {
    if (value < 0) {
      throw "Rate amount cannot be negative.";
    }

    if (value > 100) {
      throw "Rate amount cannot exceed 100.";
    }

    this._rate = value;

    // Auto-correct the minimum payment.
    this.minimumPayment = this.minimumPayment;
  }

  /**
   * Exports a simplified JSON representation containing `borrowed`, `minimumPayment`, and `rate`.
   * Note: The `uid` is excluded from the export.
   *
   * @returns A plain object containing the core debt metrics.
   */
  export(): any {
    return {
      borrowed: this.borrowed,
      minimumPayment: this.minimumPayment,
      rate: this.rate,
    };
  }

  /**
   * Validates the integrity of the debt's metrics.
   *
   * @todo Implement full validation logic for debt fields.
   * @returns A list of validation error strings (empty if valid).
   */
  validate(): string[] {
    const errors: string[] = [];

    // TODO: Validate the values are valid for a debt.

    return errors;
  }
}
