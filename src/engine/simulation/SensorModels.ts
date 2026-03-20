import { NoiseGenerator } from './NoiseGenerator'
import { SENSORS } from '../../config/sensorConfig'
import { SensorConfig, SensorType } from '../../types/sensor'

/**
 * Per-sensor accumulated state for drift, rate-of-change integration,
 * and lerp tracking that persists across update calls.
 */
interface SensorAccumulator {
  accumulatedDrift: number
  currentValue: number
  lastSimTime: number
}

const sensorState: Map<string, SensorAccumulator> = new Map()

const sensorLookup: Map<string, SensorConfig> = new Map()
for (const s of SENSORS) {
  sensorLookup.set(s.id, s)
}

function getAccumulator(sensorId: string, config: SensorConfig): SensorAccumulator {
  let acc = sensorState.get(sensorId)
  if (!acc) {
    acc = {
      accumulatedDrift: 0,
      currentValue: config.baseValue,
      lastSimTime: 0,
    }
    sensorState.set(sensorId, acc)
  }
  return acc
}

/**
 * Compute a physics-inspired sensor value based on sensor type,
 * simulation time, noise, and optional scenario overrides.
 *
 * Each sensor type has its own behavioral model. Values are clamped
 * to the sensor's configured [min, max] range.
 */
export function computeSensorValue(
  sensorId: string,
  simTime: number,
  noise: NoiseGenerator,
  overrides?: Record<string, {
    targetValue?: number
    rateOfChange?: number
    noiseMultiplier?: number
  }>,
): number {
  const config = sensorLookup.get(sensorId)
  if (!config) return 0

  const acc = getAccumulator(sensorId, config)
  const dt = simTime - acc.lastSimTime
  acc.lastSimTime = simTime

  const override = overrides?.[sensorId]
  const noiseMultiplier = override?.noiseMultiplier ?? 1
  const noiseVal = noise.fractalNoise(simTime / 1000 + hashString(sensorId)) * config.noiseAmplitude * noiseMultiplier

  let value: number

  switch (config.type as SensorType) {
    case 'temperature':
      value = computeTemperature(config, simTime, noiseVal, acc, override, dt)
      break
    case 'pressure':
      value = computePressure(config, noiseVal, acc, override, dt)
      break
    case 'flow_rate':
      value = computeFlowRate(config, noiseVal, acc, override, dt)
      break
    case 'ph':
      value = computePH(config, simTime, noiseVal, acc, override, dt)
      break
    case 'turbidity':
      value = computeTurbidity(config, noiseVal, acc, override, dt)
      break
    case 'vibration':
      value = computeVibration(config, simTime, noiseVal, acc, override, dt)
      break
    case 'level':
      value = computeLevel(config, noiseVal, acc, override, dt)
      break
    case 'rpm':
      value = computeRPM(config, noiseVal, acc, override, dt)
      break
    default:
      value = config.baseValue + noiseVal
  }

  // Clamp to sensor range
  value = Math.max(config.min, Math.min(config.max, value))
  acc.currentValue = value

  return value
}

// --- Per-type physics models ---

function computeTemperature(
  config: SensorConfig,
  simTime: number,
  noiseVal: number,
  acc: SensorAccumulator,
  override: { targetValue?: number; rateOfChange?: number } | undefined,
  dt: number,
): number {
  // Base sinusoidal cycle (period ~60s of sim time) + noise
  const cycle = 2 * Math.sin(simTime / 60000)
  let value = config.baseValue + cycle + noiseVal

  if (override?.targetValue !== undefined) {
    // Lerp current toward target
    const lerpRate = 0.0005 * Math.max(dt, 1)
    value = acc.currentValue + (override.targetValue - acc.currentValue) * Math.min(lerpRate, 1)
    value += noiseVal * 0.5
  } else if (override?.rateOfChange !== undefined) {
    acc.accumulatedDrift += override.rateOfChange * (dt / 1000)
    value += acc.accumulatedDrift
  }

  return value
}

function computePressure(
  config: SensorConfig,
  noiseVal: number,
  acc: SensorAccumulator,
  override: { targetValue?: number; rateOfChange?: number } | undefined,
  dt: number,
): number {
  let value = config.baseValue + noiseVal

  if (override?.rateOfChange !== undefined) {
    acc.accumulatedDrift += override.rateOfChange * (dt / 1000)
  }
  if (override?.targetValue !== undefined) {
    const lerpRate = 0.0003 * Math.max(dt, 1)
    value = acc.currentValue + (override.targetValue - acc.currentValue) * Math.min(lerpRate, 1)
    value += noiseVal * 0.3
  } else {
    value += acc.accumulatedDrift
  }

  return value
}

function computeFlowRate(
  config: SensorConfig,
  noiseVal: number,
  acc: SensorAccumulator,
  override: { targetValue?: number; rateOfChange?: number } | undefined,
  dt: number,
): number {
  let value = config.baseValue + noiseVal

  if (override?.targetValue !== undefined) {
    const lerpRate = 0.0004 * Math.max(dt, 1)
    value = acc.currentValue + (override.targetValue - acc.currentValue) * Math.min(lerpRate, 1)
    value += noiseVal * 0.5
  } else if (override?.rateOfChange !== undefined) {
    acc.accumulatedDrift += override.rateOfChange * (dt / 1000)
    value += acc.accumulatedDrift
  }

  return value
}

function computePH(
  config: SensorConfig,
  simTime: number,
  noiseVal: number,
  acc: SensorAccumulator,
  override: { targetValue?: number; rateOfChange?: number } | undefined,
  dt: number,
): number {
  // Slow sinusoidal drift (period ~120s sim time)
  const slowDrift = 0.1 * Math.sin(simTime / 120000)
  let value = config.baseValue + slowDrift + noiseVal * 0.05

  if (override?.targetValue !== undefined) {
    const lerpRate = 0.0002 * Math.max(dt, 1)
    value = acc.currentValue + (override.targetValue - acc.currentValue) * Math.min(lerpRate, 1)
    value += noiseVal * 0.02
  } else if (override?.rateOfChange !== undefined) {
    acc.accumulatedDrift += override.rateOfChange * (dt / 1000)
    value += acc.accumulatedDrift
  }

  return value
}

function computeTurbidity(
  config: SensorConfig,
  noiseVal: number,
  acc: SensorAccumulator,
  override: { targetValue?: number; rateOfChange?: number } | undefined,
  dt: number,
): number {
  // Correlated to filter state — base + noise
  let value = config.baseValue + Math.abs(noiseVal)

  if (override?.targetValue !== undefined) {
    const lerpRate = 0.0003 * Math.max(dt, 1)
    value = acc.currentValue + (override.targetValue - acc.currentValue) * Math.min(lerpRate, 1)
    value += Math.abs(noiseVal) * 0.3
  } else if (override?.rateOfChange !== undefined) {
    acc.accumulatedDrift += override.rateOfChange * (dt / 1000)
    value += acc.accumulatedDrift
  }

  return value
}

function computeVibration(
  config: SensorConfig,
  simTime: number,
  noiseVal: number,
  acc: SensorAccumulator,
  override: { targetValue?: number; rateOfChange?: number } | undefined,
  dt: number,
): number {
  // Vibration is always positive: base + |noise| * amplitude
  let value = config.baseValue + Math.abs(noiseVal)

  if (override?.targetValue !== undefined) {
    // Exponential degradation curve: base * (1 + k * t^1.5)
    const elapsedSec = acc.accumulatedDrift
    acc.accumulatedDrift += dt / 1000
    const k = 0.001
    const degradation = config.baseValue * (1 + k * Math.pow(elapsedSec, 1.5))
    const lerpRate = 0.0004 * Math.max(dt, 1)
    value = acc.currentValue + (override.targetValue - acc.currentValue) * Math.min(lerpRate, 1)
    // Blend in exponential degradation component
    value = Math.max(value, degradation)
    value += Math.abs(noiseVal)
  } else if (override?.rateOfChange !== undefined) {
    acc.accumulatedDrift += override.rateOfChange * (dt / 1000)
    value += acc.accumulatedDrift
  }

  return value
}

function computeLevel(
  config: SensorConfig,
  noiseVal: number,
  acc: SensorAccumulator,
  override: { targetValue?: number; rateOfChange?: number } | undefined,
  dt: number,
): number {
  // Level integrates inflow-outflow over time
  let value = config.baseValue + noiseVal * 0.5

  if (override?.targetValue !== undefined) {
    const lerpRate = 0.0003 * Math.max(dt, 1)
    value = acc.currentValue + (override.targetValue - acc.currentValue) * Math.min(lerpRate, 1)
    value += noiseVal * 0.2
  } else if (override?.rateOfChange !== undefined) {
    // Integrate rate of change (inflow - outflow)
    acc.accumulatedDrift += override.rateOfChange * (dt / 1000)
    value += acc.accumulatedDrift
  }

  return value
}

function computeRPM(
  config: SensorConfig,
  noiseVal: number,
  acc: SensorAccumulator,
  override: { targetValue?: number; rateOfChange?: number } | undefined,
  dt: number,
): number {
  let value = config.baseValue + noiseVal

  if (override?.targetValue !== undefined) {
    const lerpRate = 0.0004 * Math.max(dt, 1)
    value = acc.currentValue + (override.targetValue - acc.currentValue) * Math.min(lerpRate, 1)
    value += noiseVal * 0.3
  } else if (override?.rateOfChange !== undefined) {
    acc.accumulatedDrift += override.rateOfChange * (dt / 1000)
    value += acc.accumulatedDrift
  }

  return value
}

/**
 * Simple string hash to give each sensor a unique noise offset,
 * so sensors of the same type don't produce identical noise patterns.
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return hash
}
