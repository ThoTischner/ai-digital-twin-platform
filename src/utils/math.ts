export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t

export const inverseLerp = (a: number, b: number, value: number): number =>
  clamp((value - a) / (b - a), 0, 1)

export const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
  lerp(outMin, outMax, inverseLerp(inMin, inMax, value))

export const movingAverage = (values: number[], window: number): number => {
  if (values.length === 0) return 0
  const slice = values.slice(-window)
  return slice.reduce((a, b) => a + b, 0) / slice.length
}

export const standardDeviation = (values: number[]): number => {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

export const zScore = (value: number, mean: number, std: number): number =>
  std === 0 ? 0 : (value - mean) / std

export const pearsonCorrelation = (x: number[], y: number[]): number => {
  const n = Math.min(x.length, y.length)
  if (n < 3) return 0
  const xSlice = x.slice(-n)
  const ySlice = y.slice(-n)
  const meanX = xSlice.reduce((a, b) => a + b, 0) / n
  const meanY = ySlice.reduce((a, b) => a + b, 0) / n
  let num = 0, denX = 0, denY = 0
  for (let i = 0; i < n; i++) {
    const dx = xSlice[i] - meanX
    const dy = ySlice[i] - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }
  const den = Math.sqrt(denX * denY)
  return den === 0 ? 0 : num / den
}

export const linearRegression = (values: number[]): { slope: number; intercept: number } => {
  const n = values.length
  if (n < 2) return { slope: 0, intercept: values[0] ?? 0 }
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

export const predictThresholdCrossing = (
  values: number[],
  threshold: number,
  tickIntervalMs: number,
): number | null => {
  const { slope } = linearRegression(values)
  if (slope === 0) return null
  const current = values[values.length - 1]
  const ticksToThreshold = (threshold - current) / slope
  if (ticksToThreshold <= 0) return null
  return ticksToThreshold * tickIntervalMs
}

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
