/**
 * Generates a random integer within a specified range, inclusive of both bounds.
 *
 * @param min - The minimum possible integer value (inclusive).
 * @param max - The maximum possible integer value (inclusive).
 * @returns A random integer between min and max.
 */
export function randomIntRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Formats a numeric value to a standard money format (rounded to 2 decimal places).
 *
 * @param amount - The raw numeric value to format.
 * @returns The rounded number with at most 2 decimal places.
 */
export function toMoney(amount: number): number {
  return parseFloat(amount.toFixed(2))
}
