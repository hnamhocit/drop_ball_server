export function weightedRandomSelector(weights) {
  let totalWeight = 0;
  for (const weight of Object.values(weights)) {
    totalWeight += weight as number;
  }

  const randomNumber = Math.floor(Math.random() * totalWeight);

  let cumulativeWeight = 0;
  for (const [item, weight] of Object.entries(weights)) {
    cumulativeWeight += weight as number;
    if (randomNumber < cumulativeWeight) {
      return parseInt(item, 10);
    }
  }

  return 0;
}
