export function weightedRandomSelector(weights: { [key: number]: number }) {
  let totalWeight = 0;
  for (const weight of Object.values(weights)) {
    totalWeight += weight;
  }

  const randomNumber = Math.floor(Math.random() * totalWeight);

  let cumulativeWeight = 0;
  for (const [item, weight] of Object.entries(weights)) {
    cumulativeWeight += weight;
    if (randomNumber < cumulativeWeight) {
      return parseInt(item, 10);
    }
  }

  return 0;
}
