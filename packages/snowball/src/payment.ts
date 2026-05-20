/**
 * Represents the structure of a single debt payment breakdown, distinguishing
 * the portions that go toward the principal and interest.
 */
export interface YetiPaymentInfo {
  /** The amount of the payment applied to the principal balance. */
  principal: number
  /** The amount of the payment applied to the accrued interest. */
  interest: number
}

/**
 * Class representing a single payment breakdown into principal and interest.
 * Enforces non-negative values for both interest and principal payments.
 */
export class YetiPayment implements YetiPaymentInfo {
  private _principal: number = 0
  private _interest: number = 0

  /**
   * Constructs a new YetiPayment record.
   *
   * @param principal - The amount applied to principal.
   * @param interest - The amount applied to interest.
   * @throws If either principal or interest is negative.
   */
  constructor(principal: number, interest: number) {
    this.principal = principal
    this.interest = interest
  }

  /**
   * Gets the principal portion of the payment.
   */
  get principal(): number {
    return this._principal
  }

  /**
   * Sets the principal portion of the payment.
   *
   * @param value - The principal amount.
   * @throws "Principal amount cannot be negative." if the value is negative.
   */
  set principal(value: number) {
    if (value < 0) {
      throw "Principal amount cannot be negative."
    }
    this._principal = value
  }

  /**
   * Gets the interest portion of the payment.
   */
  get interest(): number {
    return this._interest
  }

  /**
   * Sets the interest portion of the payment.
   *
   * @param value - The interest amount.
   * @throws "Interest amount cannot be negative." if the value is negative.
   */
  set interest(value: number) {
    if (value < 0) {
      throw "Interest amount cannot be negative."
    }
    this._interest = value
  }
}
