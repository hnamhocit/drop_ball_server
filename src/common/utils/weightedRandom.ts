export default function weightedRandom(weights: Map<number, number>) {
  let totalWeight = 0;

  for (const [key, weight] of weights) {
    totalWeight += weight;
  }

  const randomNum = Math.random() * totalWeight;

  let accumulatedWeight = 0;
  for (const [key, weight] of weights) {
    accumulatedWeight += weight;
    if (randomNum < accumulatedWeight) {
      return Number(key);
    }
  }
}
