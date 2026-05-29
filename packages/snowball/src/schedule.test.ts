import { describe, it, expect } from "vitest";
import { YetiSchedule } from "./schedule";
import { YetiPayment } from "./payment";

describe("YetiSchedule", () => {
  describe("Constructor", () => {
    it("should initialize with a debt, empty payments list, and set balance to the borrowed amount", () => {
      const debt = { borrowed: 5000, minimumPayment: 150, rate: 6 };
      const schedule = new YetiSchedule(debt);

      expect(schedule.debt).toBe(debt);
      expect(schedule.payments).toEqual([]);
      expect(schedule.balance).toBe(5000);
    });
  });

  describe("Getters", () => {
    it("should return correct months count based on payments array length", () => {
      const debt = { borrowed: 1000, minimumPayment: 50, rate: 12 };
      const schedule = new YetiSchedule(debt);

      expect(schedule.months).toBe(0);

      schedule.payments.push(new YetiPayment(40, 10));
      expect(schedule.months).toBe(1);

      schedule.payments.push(new YetiPayment(45, 5));
      expect(schedule.months).toBe(2);
    });

    it("should calculate correct total interest paid across all payments", () => {
      const debt = { borrowed: 1000, minimumPayment: 50, rate: 12 };
      const schedule = new YetiSchedule(debt);

      expect(schedule.interest).toBe(0);

      schedule.payments.push(new YetiPayment(40, 10.25));
      expect(schedule.interest).toBe(10.25);

      schedule.payments.push(new YetiPayment(45, 9.876)); // 9.88 (after toMoney rounding in getter)
      expect(schedule.interest).toBe(20.13); // 10.25 + 9.88 = 20.13
    });

    it("should calculate correct total principal paid across all payments", () => {
      const debt = { borrowed: 1000, minimumPayment: 50, rate: 12 };
      const schedule = new YetiSchedule(debt);

      expect(schedule.principal).toBe(0);

      schedule.payments.push(new YetiPayment(40.5, 10));
      expect(schedule.principal).toBe(40.5);

      schedule.payments.push(new YetiPayment(45.234, 5)); // 45.23 (after toMoney rounding in getter)
      expect(schedule.principal).toBe(85.73); // 40.5 + 45.23 = 85.73
    });

    describe("isPaidOff", () => {
      it("should return false if balance is greater than 0.01", () => {
        const debt = { borrowed: 1000, minimumPayment: 50, rate: 12 };
        const schedule = new YetiSchedule(debt);
        expect(schedule.isPaidOff).toBe(false);

        schedule.balance = 0.02;
        expect(schedule.isPaidOff).toBe(false);
      });

      it("should return true if balance is 0.01 or less", () => {
        const debt = { borrowed: 1000, minimumPayment: 50, rate: 12 };
        const schedule = new YetiSchedule(debt);

        schedule.balance = 0.01;
        expect(schedule.isPaidOff).toBe(true);

        schedule.balance = 0.005;
        expect(schedule.isPaidOff).toBe(true);

        schedule.balance = 0;
        expect(schedule.isPaidOff).toBe(true);

        schedule.balance = -0.05;
        expect(schedule.isPaidOff).toBe(true);
      });
    });
  });

  describe("payment method", () => {
    it("should correctly record a payment and update the balance", () => {
      // borrowed = 1000, minPayment = 50, rate = 12%
      const debt = { borrowed: 1000, minimumPayment: 50, rate: 12 };
      const schedule = new YetiSchedule(debt);

      // First monthly payment without extra:
      // total payment = 50 + 0 = 50
      // interest = toMoney(1000 * 0.12 / 12) = 10
      // principal = toMoney(50 - 10) = 40
      // new balance = toMoney(1000 - 40) = 960
      // returned extra = 0
      const extraReturned = schedule.payment(0);

      expect(extraReturned).toBe(0);
      expect(schedule.balance).toBe(960);
      expect(schedule.payments).toHaveLength(1);
      expect(schedule.payments[0]).toEqual(new YetiPayment(40, 10));
      expect(schedule.months).toBe(1);
      expect(schedule.interest).toBe(10);
      expect(schedule.principal).toBe(40);
    });

    it("should correctly record a payment with extra payment and update the balance", () => {
      // borrowed = 1000, minPayment = 50, rate = 12%
      const debt = { borrowed: 1000, minimumPayment: 50, rate: 12 };
      const schedule = new YetiSchedule(debt);

      // First monthly payment with 150 extra payment:
      // total payment = 50 + 150 = 200
      // interest = toMoney(1000 * 0.12 / 12) = 10
      // principal = toMoney(200 - 10) = 190
      // new balance = toMoney(1000 - 190) = 810
      // returned extra = 0
      const extraReturned = schedule.payment(150);

      expect(extraReturned).toBe(0);
      expect(schedule.balance).toBe(810);
      expect(schedule.payments).toHaveLength(1);
      expect(schedule.payments[0]).toEqual(new YetiPayment(190, 10));
    });

    it("should return the excess payment amount (rollover) and set balance to 0 if payment exceeds balance", () => {
      // borrowed = 100, minPayment = 50, rate = 12%
      const debt = { borrowed: 100, minimumPayment: 50, rate: 12 };
      const schedule = new YetiSchedule(debt);

      // Payment with 100 extra payment (total 150):
      // total payment = 50 + 100 = 150
      // interest = toMoney(100 * 0.12 / 12) = 1
      // principal (uncapped) = toMoney(150 - 1) = 149
      // new balance (before clamp) = toMoney(100 - 149) = -49
      // balance is negative, so extra = toMoney(-49 * -1) = 49
      // adjusted principal = 149 - 49 = 100
      // final balance = 0
      // returned extra = 49
      const extraReturned = schedule.payment(100);

      expect(extraReturned).toBe(49);
      expect(schedule.balance).toBe(0);
      expect(schedule.isPaidOff).toBe(true);
      expect(schedule.payments).toHaveLength(1);
      expect(schedule.payments[0]).toEqual(new YetiPayment(100, 1));
    });
  });
});
