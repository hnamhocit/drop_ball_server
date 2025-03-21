export default function weightedRandom(weights: Map<number, number>): number {
  const totalWeight = Array.from(weights.values()).reduce(
    (sum, weight) => sum + weight,
    0,
  );
  let random = Math.random() * totalWeight;

  for (const [key, weight] of weights.entries()) {
    random -= weight;
    if (random <= 0) {
      return key;
    }
  }

  return Array.from(weights.keys()).pop() || 0;
}
