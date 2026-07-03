export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function lerp(start, end, t) {
  return start + (end - start) * t
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

export function randomRange(min, max) {
  return Math.random() * (max - min) + min
}

export function formatTime(seconds) {
  return `${roundTo(seconds, 1).toFixed(1)} c`
}
