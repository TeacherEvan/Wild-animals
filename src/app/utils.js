export function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function uniqueValues(items) {
  return [...new Set(items)];
}

export function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
