import type { SensorReading, SensorConfig } from '../../types/sensor'
import { linearRegression } from '../../utils/math'

const PREDICTION_WINDOW = 30

export interface Prediction {
  sensorId: string
  predictedTimeToThreshold: number // ms
  threshold: number
  confidence: number
  trendType: 'linear' | 'exponential'
  explanation: string
}

export class PredictiveEngine {
  predict(
    sensorId: string,
    readings: SensorReading[],
    config: SensorConfig,
  ): Prediction | null {
    if (readings.length < PREDICTION_WINDOW) return null

    const recentReadings = readings.slice(-PREDICTION_WINDOW)
    const values = recentReadings.map((r) => r.value)
    const current = values[values.length - 1]

    // Calculate time interval between readings
    const totalTimeSpan =
      recentReadings[recentReadings.length - 1].timestamp - recentReadings[0].timestamp
    const tickIntervalMs = totalTimeSpan / (recentReadings.length - 1)

    if (tickIntervalMs <= 0) return null

    // Linear regression
    const linearFit = linearRegression(values)
    const linearR2 = this.computeR2(values, linearFit)

    // For vibration sensors, also try exponential fit
    let expFit: { slope: number; intercept: number } | null = null
    let expR2 = 0
    const isVibration = config.type === 'vibration'

    if (isVibration) {
      const positiveValues = values.filter((v) => v > 0)
      if (positiveValues.length === values.length) {
        const logValues = values.map((v) => Math.log(v))
        expFit = linearRegression(logValues)
        expR2 = this.computeR2(logValues, expFit)
      }
    }

    const useExponential = isVibration && expFit !== null && expR2 > linearR2

    // Determine which threshold we are trending toward
    const slope = linearFit.slope
    let targetThreshold: number | null = null

    if (slope > 0) {
      // Trending upward, check warning then critical max
      if (current < config.warningMax) {
        targetThreshold = config.warningMax
      } else {
        targetThreshold = config.max
      }
    } else if (slope < 0) {
      // Trending downward, check warning then critical min
      if (current > config.warningMin) {
        targetThreshold = config.warningMin
      } else {
        targetThreshold = config.min
      }
    }

    if (targetThreshold === null) return null

    // Calculate time to threshold
    let timeToThreshold: number

    if (useExponential && expFit) {
      // Exponential: value = e^(intercept + slope * t)
      // Solve for t when e^(intercept + slope * t) = threshold
      const logThreshold = Math.log(targetThreshold)
      const currentLogEstimate = expFit.intercept + expFit.slope * (values.length - 1)
      const ticksToThreshold = expFit.slope !== 0
        ? (logThreshold - currentLogEstimate) / expFit.slope
        : Infinity
      if (ticksToThreshold <= 0 || !isFinite(ticksToThreshold)) return null
      timeToThreshold = ticksToThreshold * tickIntervalMs
    } else {
      // Linear: value = intercept + slope * t
      const currentEstimate = linearFit.intercept + linearFit.slope * (values.length - 1)
      const ticksToThreshold = linearFit.slope !== 0
        ? (targetThreshold - currentEstimate) / linearFit.slope
        : Infinity
      if (ticksToThreshold <= 0 || !isFinite(ticksToThreshold)) return null
      timeToThreshold = ticksToThreshold * tickIntervalMs
    }

    // Only predict within a reasonable window (e.g., 24 hours sim time)
    const MAX_PREDICTION_MS = 24 * 60 * 60 * 1000
    if (timeToThreshold > MAX_PREDICTION_MS) return null

    const r2 = useExponential ? expR2 : linearR2
    const confidence = Math.max(0, Math.min(r2, 1))

    // Only return predictions with reasonable confidence
    if (confidence < 0.3) return null

    const trendType = useExponential ? 'exponential' : 'linear'
    const hoursRemaining = timeToThreshold / (1000 * 60 * 60)
    const timeStr = hoursRemaining >= 1
      ? `${hoursRemaining.toFixed(1)} hours`
      : `${(hoursRemaining * 60).toFixed(0)} minutes`

    const explanation =
      `Based on ${trendType} regression of the last ${PREDICTION_WINDOW} readings, ` +
      `${config.name} is projected to reach ${targetThreshold} ${config.unit} ` +
      `in approximately ${timeStr} (confidence: ${(confidence * 100).toFixed(0)}%). ` +
      `Current value: ${current.toFixed(1)} ${config.unit}, ` +
      `trend slope: ${slope.toFixed(4)} per reading.`

    return {
      sensorId,
      predictedTimeToThreshold: timeToThreshold,
      threshold: targetThreshold,
      confidence,
      trendType,
      explanation,
    }
  }

  private computeR2(
    values: number[],
    fit: { slope: number; intercept: number },
  ): number {
    const n = values.length
    if (n < 2) return 0

    const mean = values.reduce((a, b) => a + b, 0) / n
    let ssTot = 0
    let ssRes = 0

    for (let i = 0; i < n; i++) {
      const predicted = fit.intercept + fit.slope * i
      ssTot += (values[i] - mean) ** 2
      ssRes += (values[i] - predicted) ** 2
    }

    if (ssTot === 0) return 0
    return Math.max(0, 1 - ssRes / ssTot)
  }
}
