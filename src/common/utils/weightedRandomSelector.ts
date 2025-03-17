export function weightedRandomSelector(weights: Map<number, number>): number {
  let totalWeight = 0;

  for (const weight of weights.values()) {
    totalWeight += weight;
  }

  const randomNumber = Math.random() * totalWeight;
  let cumulativeWeight = 0;

  for (const [item, weight] of weights.entries()) {
    cumulativeWeight += weight;
    if (randomNumber < cumulativeWeight) {
      return item;
    }
  }

  return 0;
}
