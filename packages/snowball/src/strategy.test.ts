import { describe, it, expect } from "vitest";
import { YetiDebt } from "./debt";
import {
  BaseYetiStrategy,
  MinimumPaymentYetiStrategy,
  BalancePaymentRatioYetiStrategy,
  BalanceRateRatioYetiStrategy,
  HighestBalanceYetiStrategy,
  HighestRateYetiStrategy,
  LowestBalanceYetiStrategy,
  LowestRateYetiStrategy,
  strategies,
} from "./strategy";

describe("Debt Strategies", () => {
  // Test data helper
  const createDebts = () => [
    new YetiDebt(1000, 10, 30, "debt-1"), // ratio (borrowed/rate) = 100, ratio (borrowed/minPayment) = 33.33
    new YetiDebt(5000, 5, 100, "debt-2"), // ratio = 1000, ratio = 50
    new YetiDebt(500, 15, 25, "debt-3"), // ratio = 33.33, ratio = 20
  ];

  describe("Sorting Logic", () => {
    it("BaseYetiStrategy (Default no sort)", () => {
      const debts = createDebts();
      const strategy = new BaseYetiStrategy(debts, 200);
      // Base class sortDebts returns 0 (retains original/JavaScript sort order)
      expect(strategy.debts[0].uid).toBe("debt-1");
      expect(strategy.debts[1].uid).toBe("debt-2");
      expect(strategy.debts[2].uid).toBe("debt-3");
    });

    it("MinimumPaymentYetiStrategy (Inherits base/no sort, sets key, extraPayment is 0)", () => {
      const debts = createDebts();
      const strategy = new MinimumPaymentYetiStrategy(debts, 200);
      expect(strategy.key).toBe("minimumPayment");
      expect(strategy.extraPayment(50)).toBe(0);
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-1", "debt-2", "debt-3"]);
    });

    it("LowestBalanceYetiStrategy (Snowball: sorts by borrowed ascending)", () => {
      const debts = createDebts();
      const strategy = new LowestBalanceYetiStrategy(debts, 200);
      expect(strategy.key).toBe("lowestBalance");
      // Sorted: 500 (debt-3), 1000 (debt-1), 5000 (debt-2)
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-3", "debt-1", "debt-2"]);
    });

    it("LowestBalanceYetiStrategy tie-breaker (same balance, sorts by rate descending)", () => {
      const debts = [new YetiDebt(1000, 10, 30, "debt-1"), new YetiDebt(1000, 15, 30, "debt-2")];
      const strategy = new LowestBalanceYetiStrategy(debts, 100);
      // Sorted: debt-2 (rate 15) then debt-1 (rate 10)
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-2", "debt-1"]);
    });

    it("HighestBalanceYetiStrategy (sorts by borrowed descending)", () => {
      const debts = createDebts();
      const strategy = new HighestBalanceYetiStrategy(debts, 200);
      expect(strategy.key).toBe("highestBalance");
      // Sorted: 5000 (debt-2), 1000 (debt-1), 500 (debt-3)
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-2", "debt-1", "debt-3"]);
    });

    it("HighestBalanceYetiStrategy tie-breaker (same balance, sorts by rate descending)", () => {
      const debts = [new YetiDebt(1000, 10, 30, "debt-1"), new YetiDebt(1000, 15, 30, "debt-2")];
      const strategy = new HighestBalanceYetiStrategy(debts, 100);
      // Sorted: debt-2 (rate 15) then debt-1 (rate 10)
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-2", "debt-1"]);
    });

    it("LowestRateYetiStrategy (sorts by rate ascending)", () => {
      const debts = createDebts();
      const strategy = new LowestRateYetiStrategy(debts, 200);
      expect(strategy.key).toBe("lowestRate");
      // Rates: debt-2 (5), debt-1 (10), debt-3 (15)
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-2", "debt-1", "debt-3"]);
    });

    it("LowestRateYetiStrategy tie-breaker (same rate, sorts by borrowed ascending)", () => {
      const debts = [new YetiDebt(2000, 10, 50, "debt-1"), new YetiDebt(1000, 10, 30, "debt-2")];
      const strategy = new LowestRateYetiStrategy(debts, 100);
      // Sorted: debt-2 (borrowed 1000) then debt-1 (borrowed 2000)
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-2", "debt-1"]);
    });

    it("HighestRateYetiStrategy (Avalanche: sorts by rate descending)", () => {
      const debts = createDebts();
      const strategy = new HighestRateYetiStrategy(debts, 200);
      expect(strategy.key).toBe("highestRate");
      // Rates: debt-3 (15), debt-1 (10), debt-2 (5)
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-3", "debt-1", "debt-2"]);
    });

    it("HighestRateYetiStrategy tie-breaker (same rate, sorts by borrowed ascending)", () => {
      const debts = [new YetiDebt(2000, 10, 50, "debt-1"), new YetiDebt(1000, 10, 30, "debt-2")];
      const strategy = new HighestRateYetiStrategy(debts, 100);
      // Sorted: debt-2 (borrowed 1000) then debt-1 (borrowed 2000)
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-2", "debt-1"]);
    });

    it("BalancePaymentRatioYetiStrategy (sorts by borrowed/minimumPayment ascending)", () => {
      const debts = createDebts();
      const strategy = new BalancePaymentRatioYetiStrategy(debts, 200);
      expect(strategy.key).toBe("balancePaymentRatio");
      // Ratios: debt-3 (20), debt-1 (33.33), debt-2 (50)
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-3", "debt-1", "debt-2"]);
    });

    it("BalancePaymentRatioYetiStrategy tie-breaker (same ratio, sorts by borrowed ascending)", () => {
      const debts = [
        new YetiDebt(2000, 10, 100, "debt-1"), // ratio = 20
        new YetiDebt(1000, 10, 50, "debt-2"), // ratio = 20
      ];
      const strategy = new BalancePaymentRatioYetiStrategy(debts, 200);
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-2", "debt-1"]);
    });

    it("BalanceRateRatioYetiStrategy (sorts by borrowed/rate ascending)", () => {
      const debts = createDebts();
      const strategy = new BalanceRateRatioYetiStrategy(debts, 200);
      expect(strategy.key).toBe("balanceRateRatio");
      // Ratios: debt-3 (33.33), debt-1 (100), debt-2 (1000)
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-3", "debt-1", "debt-2"]);
    });

    it("BalanceRateRatioYetiStrategy tie-breaker (same ratio, sorts by borrowed ascending)", () => {
      const debts = [
        new YetiDebt(2000, 10, 50, "debt-1"), // ratio = 200
        new YetiDebt(1000, 5, 30, "debt-2"), // ratio = 200
      ];
      const strategy = new BalanceRateRatioYetiStrategy(debts, 100);
      expect(strategy.debts.map((d) => d.uid)).toEqual(["debt-2", "debt-1"]);
    });
  });

  describe("Strategy Payoff Calculations (Simulation Engine)", () => {
    it("should simulate payoff correctly with extra payments using LowestBalanceYetiStrategy", () => {
      const debts = [
        new YetiDebt(100, 0, 10, "debt-A"), // No interest to make arithmetic simple
        new YetiDebt(200, 0, 20, "debt-B"), // No interest
      ];
      // Total monthly payment budget = 50.
      // Minimum payments = 10 + 20 = 30.
      // Extra payment = 50 - 30 = 20.
      // Sorted order: debt-A (lowest balance: 100) then debt-B (200).
      const strategy = new LowestBalanceYetiStrategy(debts, 50);

      // Get schedules
      const scheduleA = strategy.schedules.find((s) => s.debt.uid === "debt-A")!;
      const scheduleB = strategy.schedules.find((s) => s.debt.uid === "debt-B")!;

      // Month 1:
      // A gets min (10) + extra (20) = 30. Bal: 70
      // B gets min (20) = 20. Bal: 180
      // Month 2:
      // A gets min (10) + extra (20) = 30. Bal: 40
      // B gets min (20) = 20. Bal: 160
      // Month 3:
      // A gets min (10) + extra (20) = 30. Bal: 10
      // B gets min (20) = 20. Bal: 140
      // Month 4:
      // A gets min (10) + extra (20) = 30.
      //   A needs 10 to pay off. 20 is returned as rollover extra. Bal: 0.
      // B gets min (20) + rollover (20) = 40. Bal: 100
      // Month 5 (A is paid off):
      // B gets min (20) + extra (30) = 50. Bal: 50
      // Month 6:
      // B gets min (20) + extra (30) = 50. Bal: 0.

      expect(scheduleA.isPaidOff).toBe(true);
      expect(scheduleB.isPaidOff).toBe(true);
      expect(scheduleA.payments).toHaveLength(4);
      expect(scheduleB.payments).toHaveLength(6);

      expect(strategy.months).toBe(6);
      expect(strategy.principal).toBe(300);
      expect(strategy.interest).toBe(0);
      expect(strategy.total).toBe(300);
    });

    it("should simulate payoff correctly with no extra payment using MinimumPaymentYetiStrategy", () => {
      const debts = [new YetiDebt(100, 0, 10, "debt-A"), new YetiDebt(200, 0, 20, "debt-B")];
      // Payment budget is 50, but Minimum Payment strategy doesn't apply extra budget.
      const strategy = new MinimumPaymentYetiStrategy(debts, 50);

      const scheduleA = strategy.schedules.find((s) => s.debt.uid === "debt-A")!;
      const scheduleB = strategy.schedules.find((s) => s.debt.uid === "debt-B")!;

      // A pays 10/mo. Months = 10.
      // B pays 20/mo. Months = 10.
      expect(scheduleA.payments).toHaveLength(10);
      expect(scheduleB.payments).toHaveLength(10);
      expect(strategy.months).toBe(10);
    });
  });

  describe("Strategy Export mapping object", () => {
    it("should export strategies mapping correctly", () => {
      expect(strategies.minimumPayment).toBe(MinimumPaymentYetiStrategy);
      expect(strategies.balancePaymentRatio).toBe(BalancePaymentRatioYetiStrategy);
      expect(strategies.balanceRateRatio).toBe(BalanceRateRatioYetiStrategy);
      expect(strategies.highestBalance).toBe(HighestBalanceYetiStrategy);
      expect(strategies.highestRate).toBe(HighestRateYetiStrategy);
      expect(strategies.lowestBalance).toBe(LowestBalanceYetiStrategy);
      expect(strategies.lowestRate).toBe(LowestRateYetiStrategy);
    });
  });
});
