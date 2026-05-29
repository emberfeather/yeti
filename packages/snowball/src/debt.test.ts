import { describe, it, expect } from "vitest";
import { YetiDebt } from "./debt";

describe("YetiDebt", () => {
  describe("Constructor", () => {
    it("should initialize with valid values", () => {
      const debt = new YetiDebt(5000, 15, 120, "custom-id");
      expect(debt.borrowed).toBe(5000);
      expect(debt.rate).toBe(15);
      expect(debt.minimumPayment).toBe(120);
      expect(debt.uid).toBe("custom-id");
    });

    it("should generate a UUID if uid is not provided", () => {
      const debt = new YetiDebt(5000, 15, 120);
      expect(debt.uid).toBeDefined();
      expect(typeof debt.uid).toBe("string");
      expect(debt.uid.length).toBeGreaterThan(0);
      // Check if it's a valid UUID (simple regex matching UUID structure)
      expect(debt.uid).toMatch(/^[a-f0-9-]{36}$/i);
    });

    it("should default to 0 for missing/falsy parameters", () => {
      // @ts-expect-error - testing JS runtime behavior with falsy values
      const debt = new YetiDebt(undefined, undefined, undefined);
      expect(debt.borrowed).toBe(0);
      expect(debt.rate).toBe(0);
      expect(debt.minimumPayment).toBe(0);
    });
  });

  describe("Static Methods", () => {
    describe("calcMinimumPayment", () => {
      it("should calculate correct minimum payment with default 1% balance rate", () => {
        // Interest: 1000 * (12 / 100 / 12) = 10
        // Balance part: 1000 * 0.01 = 10
        // Expected: 20
        expect(YetiDebt.calcMinimumPayment(1000, 12)).toBe(20);
      });

      it("should calculate correct minimum payment with custom balance rate", () => {
        // Interest: 1000 * (12 / 100 / 12) = 10
        // Balance part: 1000 * 0.02 = 20
        // Expected: 30
        expect(YetiDebt.calcMinimumPayment(1000, 12, 0.02)).toBe(30);
      });

      it("should calculate correct minimum payment with zero balance rate", () => {
        // Interest: 1000 * (12 / 100 / 12) = 10
        // Balance part: 0
        // Expected: 10
        expect(YetiDebt.calcMinimumPayment(1000, 12, 0)).toBe(10);
      });
    });

    describe("fixed", () => {
      it("should round numbers to 2 decimal places", () => {
        expect(YetiDebt.fixed(10.1234)).toBe(10.12);
        expect(YetiDebt.fixed(10.126)).toBe(10.13);
        expect(YetiDebt.fixed(10)).toBe(10);
      });
    });

    describe("fromExport", () => {
      it("should create a YetiDebt instance from exported structure", () => {
        const exported = { borrowed: 4000, rate: 8.5, minimumPayment: 150 };
        const debt = YetiDebt.fromExport(exported);
        expect(debt).toBeInstanceOf(YetiDebt);
        expect(debt.borrowed).toBe(4000);
        expect(debt.rate).toBe(8.5);
        expect(debt.minimumPayment).toBe(150);
      });
    });

    describe("randomDebt", () => {
      it("should generate a random debt with valid fields", () => {
        const debt = YetiDebt.randomDebt();
        expect(debt).toBeInstanceOf(YetiDebt);
        expect(debt.borrowed).toBeGreaterThanOrEqual(500);
        expect(debt.borrowed).toBeLessThanOrEqual(20000);
        expect(debt.rate).toBeGreaterThanOrEqual(3);
        expect(debt.rate).toBeLessThanOrEqual(21);
        expect(debt.minimumPayment).toBe(YetiDebt.calcMinimumPayment(debt.borrowed, debt.rate));
      });
    });
  });

  describe("Getters and Setters", () => {
    describe("borrowed", () => {
      it("should throw error if set to negative", () => {
        const debt = new YetiDebt(1000, 10, 50);
        expect(() => {
          debt.borrowed = -100;
        }).toThrow("Borrowed amount cannot be negative.");
      });

      it("should update value and auto-correct minimum payment if interest increases", () => {
        // Initial: borrowed 1000, rate 12, min payment 15 (interest is 10)
        const debt = new YetiDebt(1000, 12, 15);
        expect(debt.borrowed).toBe(1000);
        expect(debt.minimumPayment).toBe(15);

        // Update borrowed to 2000. Interest becomes 20.
        // Current minimum payment (15) is less than interest (20).
        // It should auto-correct to 20.
        debt.borrowed = 2000;
        expect(debt.borrowed).toBe(2000);
        expect(debt.minimumPayment).toBe(20);
      });
    });

    describe("rate", () => {
      it("should throw error if set to negative", () => {
        const debt = new YetiDebt(1000, 10, 50);
        expect(() => {
          debt.rate = -1;
        }).toThrow("Rate amount cannot be negative.");
      });

      it("should throw error if set to > 100", () => {
        const debt = new YetiDebt(1000, 10, 50);
        expect(() => {
          debt.rate = 101;
        }).toThrow("Rate amount cannot exceed 100.");
      });

      it("should update value and auto-correct minimum payment if interest increases", () => {
        // Initial: borrowed 1000, rate 12, min payment 15 (interest is 10)
        const debt = new YetiDebt(1000, 12, 15);

        // Update rate to 24%. Interest becomes 20.
        // Minimum payment should auto-correct from 15 to 20.
        debt.rate = 24;
        expect(debt.rate).toBe(24);
        expect(debt.minimumPayment).toBe(20);
      });
    });

    describe("minimumPayment", () => {
      it("should throw error if set to negative", () => {
        const debt = new YetiDebt(1000, 10, 50);
        expect(() => {
          debt.minimumPayment = -10;
        }).toThrow("Minimum payment amount cannot be negative.");
      });

      it("should cap the value at interestOnlyPayment", () => {
        // borrowed 1000, rate 12 -> interestOnlyPayment is 10.
        const debt = new YetiDebt(1000, 12, 20);

        // Try setting minimumPayment to 5. It should be capped at 10.
        debt.minimumPayment = 5;
        expect(debt.minimumPayment).toBe(10);

        // Try setting minimumPayment to 15. It should work because 15 >= 10.
        debt.minimumPayment = 15;
        expect(debt.minimumPayment).toBe(15);
      });
    });

    describe("interestOnlyPayment", () => {
      it("should return the correct interest-only payment value", () => {
        const debt = new YetiDebt(1000, 12, 50);
        expect(debt.interestOnlyPayment).toBe(10);
      });
    });
  });

  describe("Instance Methods", () => {
    describe("export", () => {
      it("should return only borrowed, minimumPayment, and rate", () => {
        const debt = new YetiDebt(5000, 6.5, 100, "custom-id");
        const exported = debt.export();
        expect(exported).toEqual({
          borrowed: 5000,
          minimumPayment: 100,
          rate: 6.5,
        });
        expect(exported.uid).toBeUndefined();
      });
    });

    describe("validate", () => {
      it("should return empty errors list", () => {
        const debt = new YetiDebt(5000, 6.5, 100);
        expect(debt.validate()).toEqual([]);
      });
    });
  });
});
