import { HealthStatus } from '../types/sensor'
import { Severity } from '../types/agent'

export const healthColors: Record<HealthStatus, string> = {
  normal: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
}

export const healthColorsHex: Record<HealthStatus, number> = {
  normal: 0x10b981,
  warning: 0xf59e0b,
  critical: 0xef4444,
}

export const severityColors: Record<Severity, string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  critical: '#ef4444',
}

export const sensorTypeColors: Record<string, string> = {
  temperature: '#ef4444',
  pressure: '#f59e0b',
  flow_rate: '#3b82f6',
  ph: '#8b5cf6',
  turbidity: '#06b6d4',
  vibration: '#f97316',
  level: '#10b981',
  rpm: '#ec4899',
}

export const chartGridColor = '#1e293b'
export const chartTextColor = '#64748b'
