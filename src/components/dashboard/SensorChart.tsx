import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  ReferenceLine,
  ResponsiveContainer,
  YAxis,
} from 'recharts'
import clsx from 'clsx'
import { useSensorStore } from '../../engine/store/sensorStore'
import { sensorTypeColors, healthColors, chartGridColor } from '../../utils/colors'
import { formatValue } from '../../utils/format'

interface SensorChartProps {
  sensorId: string
}

export const SensorChart: React.FC<SensorChartProps> = ({ sensorId }) => {
  const sensor = useSensorStore((s) => s.sensors[sensorId])

  const chartData = useMemo(() => {
    if (!sensor) return []
    const readings = sensor.readings.slice(-100)
    return readings.map((r, i) => ({ idx: i, value: r.value }))
  }, [sensor?.readings.length])

  if (!sensor) return null

  const { config, currentValue, health } = sensor
  const color = sensorTypeColors[config.type] ?? '#3b82f6'
  const healthColor = healthColors[health]

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={clsx('w-2 h-2 rounded-full shrink-0')}
            style={{ backgroundColor: healthColor }}
          />
          <span className="text-[#e2e8f0] text-[11px] font-medium truncate">
            {config.name}
          </span>
        </div>
        <span className="text-[#e2e8f0] text-[11px] font-mono">
          {formatValue(currentValue, config.unit)}
        </span>
      </div>

      {/* Chart */}
      <div className="w-full h-[90px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
          >
            <defs>
              <linearGradient id={`grad-${sensorId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <YAxis
              domain={[config.min, config.max]}
              hide
            />
            {/* Warning thresholds */}
            <ReferenceLine
              y={config.warningMax}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeOpacity={0.4}
            />
            <ReferenceLine
              y={config.warningMin}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeOpacity={0.4}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${sensorId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
