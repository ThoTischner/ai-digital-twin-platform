import React from 'react'
import clsx from 'clsx'
import { formatValue } from '../../utils/format'

interface QuickGaugeProps {
  label: string
  value: number
  min: number
  max: number
  unit: string
  warningMin?: number
  warningMax?: number
  normalMin?: number
  normalMax?: number
}

function getGaugeColor(
  value: number,
  normalMin?: number,
  normalMax?: number,
  warningMin?: number,
  warningMax?: number,
): string {
  if (normalMin !== undefined && normalMax !== undefined) {
    if (value >= normalMin && value <= normalMax) return 'bg-emerald-500'
  }
  if (warningMin !== undefined && warningMax !== undefined) {
    if (value >= warningMin && value <= warningMax) return 'bg-amber-500'
  }
  if (normalMin !== undefined && normalMax !== undefined) {
    if (value < normalMin || value > normalMax) {
      if (warningMin !== undefined && warningMax !== undefined) {
        if (value < warningMin || value > warningMax) return 'bg-red-500'
      }
      return 'bg-amber-500'
    }
  }
  return 'bg-emerald-500'
}

const QuickGauge: React.FC<QuickGaugeProps> = ({
  label,
  value,
  min,
  max,
  unit,
  warningMin,
  warningMax,
  normalMin,
  normalMax,
}) => {
  const fillPercent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  const colorClass = getGaugeColor(value, normalMin, normalMax, warningMin, warningMax)

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-[#94a3b8] w-20 truncate shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-300', colorClass)}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      <span className="text-[#e2e8f0] w-16 text-right shrink-0 font-mono text-[11px]">
        {formatValue(value, unit)}
      </span>
    </div>
  )
}

export default QuickGauge
