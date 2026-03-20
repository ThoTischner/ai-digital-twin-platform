import type { SensorReading, SensorConfig } from '../../types/sensor'
import { movingAverage, standardDeviation, zScore } from '../../utils/math'

const ROLLING_WINDOW = 50
const ZSCORE_WARNING = 2.5
const ZSCORE_CRITICAL = 3.5
const ROC_WINDOW = 5
const ROC_MULTIPLIER = 3

export interface AnomalyResult {
  score: number
  method: string
  detail: string
}

export class AnomalyDetector {
  analyze(
    sensorId: string,
    readings: SensorReading[],
    config: SensorConfig,
  ): AnomalyResult {
    if (readings.length < 3) {
      return { score: 0, method: 'none', detail: 'Insufficient data for analysis.' }
    }

    const values = readings.map((r) => r.value)
    const current = values[values.length - 1]

    const zScoreResult = this.analyzeZScore(values, current, config)
    const rocResult = this.analyzeRateOfChange(values, config)
    const rangeResult = this.analyzeRange(current, config)

    // Return the method with the highest weighted score
    const results = [zScoreResult, rocResult, rangeResult]
    let best = results[0]
    for (const r of results) {
      if (r.score > best.score) {
        best = r
      }
    }

    return best
  }

  private analyzeZScore(
    values: number[],
    current: number,
    config: SensorConfig,
  ): AnomalyResult {
    const window = values.slice(-ROLLING_WINDOW)
    const mean = movingAverage(window, window.length)
    const std = standardDeviation(window)
    const z = Math.abs(zScore(current, mean, std))

    if (z > ZSCORE_CRITICAL) {
      return {
        score: 0.9,
        method: 'z-score',
        detail: `Current reading of ${current.toFixed(1)} ${config.unit} is ${z.toFixed(1)}\u03C3 above the rolling mean (${mean.toFixed(1)} ${config.unit}). This is a critical statistical deviation.`,
      }
    }

    if (z > ZSCORE_WARNING) {
      return {
        score: 0.6,
        method: 'z-score',
        detail: `Current reading of ${current.toFixed(1)} ${config.unit} is ${z.toFixed(1)}\u03C3 above the rolling mean (${mean.toFixed(1)} ${config.unit}). This pattern warrants monitoring.`,
      }
    }

    return {
      score: z / ZSCORE_CRITICAL * 0.4,
      method: 'z-score',
      detail: `Statistical deviation within normal bounds (z=${z.toFixed(2)}).`,
    }
  }

  private analyzeRateOfChange(
    values: number[],
    config: SensorConfig,
  ): AnomalyResult {
    if (values.length < ROC_WINDOW + 1) {
      return { score: 0, method: 'rate-of-change', detail: 'Insufficient data for rate-of-change analysis.' }
    }

    const recent = values.slice(-ROC_WINDOW)
    // Compute average derivative over the window
    let totalDelta = 0
    for (let i = 1; i < recent.length; i++) {
      totalDelta += Math.abs(recent[i] - recent[i - 1])
    }
    const avgDerivative = totalDelta / (recent.length - 1)
    const normalNoise = config.noiseAmplitude

    if (normalNoise === 0) {
      return { score: 0, method: 'rate-of-change', detail: 'No noise baseline for rate-of-change comparison.' }
    }

    const ratio = avgDerivative / normalNoise

    if (ratio > ROC_MULTIPLIER) {
      const score = Math.min(0.7 + (ratio - ROC_MULTIPLIER) * 0.05, 0.95)
      return {
        score,
        method: 'rate-of-change',
        detail: `Rate of change is ${ratio.toFixed(1)}x the normal noise amplitude (${normalNoise} ${config.unit}). Rapid ${values[values.length - 1] > values[values.length - 2] ? 'increase' : 'decrease'} detected.`,
      }
    }

    return {
      score: (ratio / ROC_MULTIPLIER) * 0.3,
      method: 'rate-of-change',
      detail: `Rate of change within expected bounds (${ratio.toFixed(1)}x noise).`,
    }
  }

  private analyzeRange(
    current: number,
    config: SensorConfig,
  ): AnomalyResult {
    const { warningMax, warningMin, normalMax, normalMin } = config

    // Check if value exceeds warning thresholds
    let score = 0
    let detail = ''

    if (current >= warningMax) {
      const criticalRange = config.max - warningMax
      const overshoot = criticalRange > 0
        ? Math.min((current - warningMax) / criticalRange, 1)
        : 1
      score = 0.7 + overshoot * 0.3
      detail = `Reading of ${current.toFixed(1)} ${config.unit} exceeds warning threshold (${warningMax} ${config.unit}) by ${(current - warningMax).toFixed(1)} ${config.unit}.`
    } else if (current <= warningMin) {
      const criticalRange = warningMin - config.min
      const overshoot = criticalRange > 0
        ? Math.min((warningMin - current) / criticalRange, 1)
        : 1
      score = 0.7 + overshoot * 0.3
      detail = `Reading of ${current.toFixed(1)} ${config.unit} below warning threshold (${warningMin} ${config.unit}) by ${(warningMin - current).toFixed(1)} ${config.unit}.`
    } else if (current > normalMax) {
      score = (current - normalMax) / (warningMax - normalMax)
      score = Math.min(score * 0.6, 0.6)
      detail = `Reading of ${current.toFixed(1)} ${config.unit} above normal range (${normalMax} ${config.unit}) but within warning limits.`
    } else if (current < normalMin) {
      score = (normalMin - current) / (normalMin - warningMin)
      score = Math.min(score * 0.6, 0.6)
      detail = `Reading of ${current.toFixed(1)} ${config.unit} below normal range (${normalMin} ${config.unit}) but within warning limits.`
    } else {
      detail = `Reading of ${current.toFixed(1)} ${config.unit} within normal operating range.`
    }

    return { score, method: 'range-check', detail }
  }
}
