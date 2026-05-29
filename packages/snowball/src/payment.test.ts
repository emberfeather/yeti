import { describe, it, expect } from "vitest";
import { YetiPayment } from "./payment";

describe("YetiPayment", () => {
  it("should initialize principal and interest properties", () => {
    const payment = new YetiPayment(75.5, 4.5);
    expect(payment.principal).toBe(75.5);
    expect(payment.interest).toBe(4.5);
  });

  it("should allow zero value for principal and interest", () => {
    const payment = new YetiPayment(0, 0);
    expect(payment.principal).toBe(0);
    expect(payment.interest).toBe(0);
  });

  it("should throw error if constructor is called with negative principal", () => {
    expect(() => {
      new YetiPayment(-10, 5);
    }).toThrow("Principal amount cannot be negative.");
  });

  it("should throw error if constructor is called with negative interest", () => {
    expect(() => {
      new YetiPayment(50, -5);
    }).toThrow("Interest amount cannot be negative.");
  });

  it("should throw error if principal is set to a negative value", () => {
    const payment = new YetiPayment(50, 5);
    expect(() => {
      payment.principal = -1;
    }).toThrow("Principal amount cannot be negative.");
  });

  it("should throw error if interest is set to a negative value", () => {
    const payment = new YetiPayment(50, 5);
    expect(() => {
      payment.interest = -1;
    }).toThrow("Interest amount cannot be negative.");
  });
});
