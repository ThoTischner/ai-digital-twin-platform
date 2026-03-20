import React from 'react'
import clsx from 'clsx'
import { Disc } from 'lucide-react'
import { useControlStore } from '../../engine/store/controlStore'
import { useSensorStore } from '../../engine/store/sensorStore'
import { getEquipmentById } from '../../config/plantLayout'
import QuickGauge from './QuickGauge'

interface ValveControlProps {
  equipmentId: string
}

const ValveControl: React.FC<ValveControlProps> = ({ equipmentId }) => {
  const equipment = getEquipmentById(equipmentId)
  const valve = useControlStore((s) => s.valves[equipmentId])
  const mode = useControlStore((s) => s.mode)
  const emergencyStop = useControlStore((s) => s.emergencyStop)
  const setValveOpen = useControlStore((s) => s.setValveOpen)
  const allSensors = useSensorStore((s) => s.sensors)

  if (!valve || !equipment) return null

  const isDisabled = mode === 'auto'
  const openPercent = emergencyStop ? 0 : valve.openPercent

  // Gradient color from red (closed) to green (open)
  const getBarGradient = () => {
    if (openPercent <= 10) return 'bg-red-500'
    if (openPercent <= 40) return 'bg-amber-500'
    if (openPercent <= 70) return 'bg-emerald-400'
    return 'bg-emerald-500'
  }

  const flowSensor = valve.flowSensorId ? allSensors[valve.flowSensorId] : null

  return (
    <div
      className={clsx(
        'rounded-lg border p-3 transition-all duration-300 relative',
        emergencyStop
          ? 'border-red-600 bg-[#1a1a2e]/50'
          : 'border-[#2a2a3e] bg-[#12121a]',
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
        <Disc size={14} className="text-[#94a3b8]" />
        <span className="text-sm font-semibold text-[#e2e8f0]">{equipment.name}</span>
      </div>

      {/* Valve position indicator */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Position</span>
          <span className="text-xs font-mono text-[#e2e8f0]">{Math.round(openPercent)}%</span>
        </div>
        <div className="h-3 bg-[#1a1a2e] rounded-full overflow-hidden border border-[#2a2a3e]">
          <div
            className={clsx('h-full rounded-full transition-all duration-300', getBarGradient())}
            style={{ width: `${openPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[9px] text-red-400">CLOSED</span>
          <span className="text-[9px] text-emerald-400">OPEN</span>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-3">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={openPercent}
          disabled={isDisabled}
          onChange={(e) => setValveOpen(equipmentId, Number(e.target.value))}
          className={clsx(
            'w-full h-1.5 rounded-full appearance-none cursor-pointer',
            'bg-[#1a1a2e] [&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#e2e8f0]',
            isDisabled && 'cursor-not-allowed opacity-50',
          )}
        />
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2 mb-3">
        <button
          disabled={isDisabled}
          onClick={() => setValveOpen(equipmentId, 0)}
          className={clsx(
            'flex-1 text-[10px] font-semibold py-1.5 rounded border transition-all',
            'focus:outline-none uppercase tracking-wider',
            isDisabled
              ? 'cursor-not-allowed opacity-50 bg-[#1a1a2e] border-[#2a2a3e] text-[#94a3b8]'
              : 'bg-red-600/10 border-red-600/30 text-red-400 hover:bg-red-600/20 cursor-pointer',
          )}
        >
          Close
        </button>
        <button
          disabled={isDisabled}
          onClick={() => setValveOpen(equipmentId, 100)}
          className={clsx(
            'flex-1 text-[10px] font-semibold py-1.5 rounded border transition-all',
            'focus:outline-none uppercase tracking-wider',
            isDisabled
              ? 'cursor-not-allowed opacity-50 bg-[#1a1a2e] border-[#2a2a3e] text-[#94a3b8]'
              : 'bg-emerald-600/10 border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/20 cursor-pointer',
          )}
        >
          Open
        </button>
      </div>

      {/* Flow readout */}
      {flowSensor && (
        <QuickGauge
          label="Flow Rate"
          value={flowSensor.currentValue}
          min={flowSensor.config.min}
          max={flowSensor.config.max}
          unit={flowSensor.config.unit}
          normalMin={flowSensor.config.normalMin}
          normalMax={flowSensor.config.normalMax}
          warningMin={flowSensor.config.warningMin}
          warningMax={flowSensor.config.warningMax}
        />
      )}
    </div>
  )
}

export default ValveControl
