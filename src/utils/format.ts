export const formatValue = (value: number, unit: string): string => {
  if (unit === 'pH') return value.toFixed(2)
  if (unit === 'RPM') return Math.round(value).toLocaleString()
  if (unit === '%') return `${value.toFixed(1)}%`
  if (unit === '°C') return `${value.toFixed(1)}°C`
  return `${value.toFixed(1)} ${unit}`
}

export const formatSimTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const formatDuration = (ms: number): string => {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)} min`
  return `${(ms / 3600000).toFixed(1)} hrs`
}

export const formatCost = (value: number): string =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

export const formatConfidence = (value: number): string =>
  `${(value * 100).toFixed(0)}%`
