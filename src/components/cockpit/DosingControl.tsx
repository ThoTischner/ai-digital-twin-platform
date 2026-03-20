import React from 'react'
import clsx from 'clsx'
import { FlaskConical } from 'lucide-react'
import { useControlStore } from '../../engine/store/controlStore'
import { useSensorStore } from '../../engine/store/sensorStore'
import { getEquipmentById } from '../../config/plantLayout'
import { formatValue } from '../../utils/format'

interface DosingControlProps {
  equipmentId: string
}

const DosingControl: React.FC<DosingControlProps> = ({ equipmentId }) => {
  const equipment = getEquipmentById(equipmentId)
  const dosing = useControlStore((s) => s.dosing[equipmentId])
  const mode = useControlStore((s) => s.mode)
  const setDosingTargetPh = useControlStore((s) => s.setDosingTargetPh)
  const setDosingRate = useControlStore((s) => s.setDosingRate)
  const sensors = useSensorStore((s) => s.sensors)

  if (!dosing || !equipment) return null

  const isDisabled = mode === 'auto'
  const phSensor = dosing.phSensorId ? sensors[dosing.phSensorId] : null
  const currentPh = phSensor?.currentValue ?? 7.0

  // pH color coding
  const getPhColor = () => {
    if (currentPh >= 6.5 && currentPh <= 7.5) return 'text-emerald-400'
    if (currentPh >= 6.0 && currentPh <= 8.0) return 'text-amber-400'
    return 'text-red-400'
  }

  const getPhBgColor = () => {
    if (currentPh >= 6.5 && currentPh <= 7.5) return 'bg-emerald-500'
    if (currentPh >= 6.0 && currentPh <= 8.0) return 'bg-amber-500'
    return 'bg-red-500'
  }

  // pH deviation: how far current is from target, mapped to a bar
  const deviation = currentPh - dosing.targetPh
  const maxDeviation = 2.0
  const deviationPercent = Math.max(-100, Math.min(100, (deviation / maxDeviation) * 100))

  return (
    <div
      className={clsx(
        'rounded-lg border p-3 transition-all duration-300 relative',
        'border-[#2a2a3e] bg-[#12121a]',
      )}
    >
      {/* AI badge */}
      {mode === 'auto' && (
        <span className="absolute top-2 right-2 text-[9px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded font-medium">
          AI Controlled
        </span>
      )}
      {mode === 'hybrid' && (
        <span className="absolute top-2 right-2 text-[9px] bg-purple-600/20 text-purple-400 px-1.5 py-0.5 rounded font-medium">
          AI Suggests
        </span>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical size={14} className="text-purple-400" />
        <span className="text-sm font-semibold text-[#e2e8f0]">Chemical Dosing</span>
      </div>

      {/* Target pH */}
      <div className="mb-3">
        <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Target pH</span>
        <div className="flex items-center gap-2 mt-1">
          <button
            disabled={isDisabled}
            onClick={() => setDosingTargetPh(equipmentId, dosing.targetPh - 0.1)}
            className={clsx(
              'w-7 h-7 rounded border text-sm font-bold flex items-center justify-center',
              'focus:outline-none transition-all',
              isDisabled
                ? 'cursor-not-allowed opacity-50 bg-[#1a1a2e] border-[#2a2a3e] text-[#94a3b8]'
                : 'bg-[#1a1a2e] border-[#2a2a3e] text-[#e2e8f0] hover:bg-[#2a2a3e] cursor-pointer',
            )}
          >
            -
          </button>
          <span className="text-2xl font-mono font-bold text-[#e2e8f0] min-w-[60px] text-center">
            {dosing.targetPh.toFixed(1)}
          </span>
          <button
            disabled={isDisabled}
            onClick={() => setDosingTargetPh(equipmentId, dosing.targetPh + 0.1)}
            className={clsx(
              'w-7 h-7 rounded border text-sm font-bold flex items-center justify-center',
              'focus:outline-none transition-all',
              isDisabled
                ? 'cursor-not-allowed opacity-50 bg-[#1a1a2e] border-[#2a2a3e] text-[#94a3b8]'
                : 'bg-[#1a1a2e] border-[#2a2a3e] text-[#e2e8f0] hover:bg-[#2a2a3e] cursor-pointer',
            )}
          >
            +
          </button>
        </div>
      </div>

      {/* Current pH readout */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Current pH</span>
          <span className={clsx('text-lg font-mono font-bold', getPhColor())}>
            {formatValue(currentPh, 'pH')}
          </span>
        </div>
      </div>

      {/* pH Deviation indicator */}
      <div className="mb-3">
        <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Deviation</span>
        <div className="relative h-2 bg-[#1a1a2e] rounded-full mt-1 overflow-hidden">
          {/* Center mark */}
          <div className="absolute left-1/2 top-0 w-px h-full bg-[#94a3b8]/30 z-10" />
          {/* Deviation bar */}
          <div
            className={clsx(
              'absolute top-0 h-full rounded-full transition-all duration-300',
              getPhBgColor(),
            )}
            style={{
              left: deviationPercent >= 0 ? '50%' : `${50 + deviationPercent / 2}%`,
              width: `${Math.abs(deviationPercent) / 2}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[9px] text-[#94a3b8]">Acidic</span>
          <span className="text-[9px] text-[#94a3b8]">Alkaline</span>
        </div>
      </div>

      {/* Dosing rate slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Dosing Rate</span>
          <span className="text-xs font-mono text-[#e2e8f0]">{Math.round(dosing.dosingRate)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={dosing.dosingRate}
          disabled={isDisabled}
          onChange={(e) => setDosingRate(equipmentId, Number(e.target.value))}
          className={clsx(
            'w-full h-1.5 rounded-full appearance-none cursor-pointer',
            'bg-[#1a1a2e] [&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400',
            isDisabled && 'cursor-not-allowed opacity-50',
          )}
        />
      </div>
    </div>
  )
}

export default DosingControl
