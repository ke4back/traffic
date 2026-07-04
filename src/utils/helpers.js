export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function roundTo(value, digits = 0) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function distanceBetween(pointA, pointB) {
  return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y)
}

export function normalizeVector(vector) {
  const length = Math.hypot(vector.x, vector.y) || 1

  return {
    x: vector.x / length,
    y: vector.y / length,
  }
}

export function pickRandom(items) {
  if (!items.length) {
    return null
  }

  return items[Math.floor(Math.random() * items.length)]
}

export function pickWeightedRandom(items, getWeight) {
  const weightedItems = items
    .map((item) => ({
      item,
      weight: Math.max(0, getWeight(item)),
    }))
    .filter(({ weight }) => weight > 0)

  const totalWeight = weightedItems.reduce((sum, { weight }) => sum + weight, 0)

  if (totalWeight <= 0) {
    return null
  }

  let threshold = Math.random() * totalWeight

  for (const entry of weightedItems) {
    threshold -= entry.weight

    if (threshold <= 0) {
      return entry.item
    }
  }

  return weightedItems[weightedItems.length - 1]?.item ?? null
}

export function randomRange(min, max) {
  return Math.random() * (max - min) + min
}

export function formatTime(seconds) {
  return `${roundTo(seconds, 1).toFixed(1)} c`
}

export function deepMerge(baseValue, patchValue) {
  if (!isPlainObject(baseValue) || !isPlainObject(patchValue)) {
    return patchValue
  }

  const merged = { ...baseValue }

  Object.keys(patchValue).forEach((key) => {
    merged[key] = deepMerge(baseValue[key], patchValue[key])
  })

  return merged
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
