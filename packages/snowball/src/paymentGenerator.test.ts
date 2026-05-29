import { describe, it, expect } from "vitest"
import {
  RepeatingPaymentGenerator,
  GrowingPaymentGenerator,
  getPaymentForMonth,
  addExtraPayment,
} from "./paymentGenerator"

describe("Payment Generators", () => {
  describe("getPaymentForMonth", () => {
    it("should return the number if passed a number", () => {
      expect(getPaymentForMonth(100, 1)).toBe(100)
    })

    it("should call the function if passed a function", () => {
      const func = (month: number) => month * 10
      expect(getPaymentForMonth(func, 5)).toBe(50)
    })

    it("should call getPayment if passed a generator object", () => {
      const gen = new RepeatingPaymentGenerator([100, 200])
      expect(getPaymentForMonth(gen, 2)).toBe(200)
    })

    it("should throw if passed an invalid type", () => {
      expect(() => getPaymentForMonth("invalid" as any, 1)).toThrow()
    })
  })

  describe("addExtraPayment", () => {
    it("should add to a number", () => {
      expect(addExtraPayment(100, 50)).toBe(150)
    })

    it("should return a wrapped function", () => {
      const func = (month: number) => month * 10
      const newFunc = addExtraPayment(func, 50) as (month: number) => number
      expect(newFunc(5)).toBe(100) // 5 * 10 + 50
    })

    it("should return a wrapped generator object", () => {
      const gen = new RepeatingPaymentGenerator([100, 200])
      const newGen = addExtraPayment(gen, 50) as any
      expect(newGen.getPayment(2)).toBe(250) // 200 + 50
    })
  })

  describe("RepeatingPaymentGenerator", () => {
    it("should cycle through payments correctly", () => {
      const gen = new RepeatingPaymentGenerator([100, 200, 300])

      // month is 1-indexed
      expect(gen.getPayment(1)).toBe(100)
      expect(gen.getPayment(2)).toBe(200)
      expect(gen.getPayment(3)).toBe(300)
      expect(gen.getPayment(4)).toBe(100)
      expect(gen.getPayment(5)).toBe(200)
    })

    it("should throw on empty array", () => {
      expect(() => new RepeatingPaymentGenerator([])).toThrow()
    })
  })

  describe("GrowingPaymentGenerator", () => {
    it("should handle flat amount increases", () => {
      // 100 initial, +50 every 3 months
      const gen = new GrowingPaymentGenerator(100, 50, 0, 3)

      expect(gen.getPayment(1)).toBe(100)
      expect(gen.getPayment(2)).toBe(100)
      expect(gen.getPayment(3)).toBe(100)
      expect(gen.getPayment(4)).toBe(150)
      expect(gen.getPayment(5)).toBe(150)
      expect(gen.getPayment(6)).toBe(150)
      expect(gen.getPayment(7)).toBe(200)
    })

    it("should handle percentage rate increases", () => {
      // 100 initial, +10% every 2 months
      const gen = new GrowingPaymentGenerator(100, 0, 0.1, 2)

      expect(gen.getPayment(1)).toBe(100)
      expect(gen.getPayment(2)).toBe(100)
      expect(gen.getPayment(3)).toBe(110) // 100 * 1.1
      expect(gen.getPayment(4)).toBe(110)
      expect(gen.getPayment(5)).toBe(121) // 110 * 1.1
    })

    it("should throw on negative initial payment or non-positive interval", () => {
      expect(() => new GrowingPaymentGenerator(-100)).toThrow()
      expect(() => new GrowingPaymentGenerator(100, 0, 0, 0)).toThrow()
    })
  })
})
