const randomIntRange = (min: number, max: number): number => {
  // Inclusive.
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export { randomIntRange }
