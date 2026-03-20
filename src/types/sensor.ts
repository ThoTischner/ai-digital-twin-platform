export type SensorType =
  | 'temperature'
  | 'pressure'
  | 'flow_rate'
  | 'ph'
  | 'turbidity'
  | 'vibration'
  | 'level'
  | 'rpm'

export type HealthStatus = 'normal' | 'warning' | 'critical'

export interface SensorConfig {
  id: string
  name: string
  type: SensorType
  unit: string
  equipmentId: string
  min: number
  max: number
  normalMin: number
  normalMax: number
  warningMin: number
  warningMax: number
  baseValue: number
  noiseAmplitude: number
  updateIntervalMs: number
}

export interface SensorReading {
  timestamp: number
  value: number
  anomalyScore: number
}

export interface SensorState {
  config: SensorConfig
  currentValue: number
  health: HealthStatus
  readings: SensorReading[]
  anomalyScore: number
  trend: 'stable' | 'rising' | 'falling'
  rateOfChange: number
}
