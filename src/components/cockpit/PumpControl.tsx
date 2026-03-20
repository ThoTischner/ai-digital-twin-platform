import React from 'react'
import clsx from 'clsx'
import { Power } from 'lucide-react'
import { useControlStore } from '../../engine/store/controlStore'
import { useSensorStore } from '../../engine/store/sensorStore'
import { getEquipmentById } from '../../config/plantLayout'
import QuickGauge from './QuickGauge'

interface PumpControlProps {
  equipmentId: string
}

const PumpControl: React.FC<PumpControlProps> = ({ equipmentId }) => {
  const equipment = getEquipmentById(equipmentId)
  const pump = useControlStore((s) => s.pumps[equipmentId])
  const mode = useControlStore((s) => s.mode)
  const emergencyStop = useControlStore((s) => s.emergencyStop)
  const setPumpRunning = useControlStore((s) => s.setPumpRunning)
  const setPumpRpm = useControlStore((s) => s.setPumpRpm)
  const allSensors = useSensorStore((s) => s.sensors)

  if (!pump || !equipment) return null

  const isDisabled = mode === 'auto'
  const isRunning = pump.running && !emergencyStop
  const rpmPercent = (pump.targetRpm / 3600) * 100

  const getRpmBarColor = () => {
    if (pump.targetRpm <= 2000) return 'bg-emerald-500'
    if (pump.targetRpm <= 2800) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const equipmentSensors = Object.values(allSensors).filter(s => s.config.equipmentId === equipmentId)
  const vibSensor = equipmentSensors.find((s) => s.config.type === 'vibration')
  const tempSensor = equipmentSensors.find((s) => s.config.type === 'temperature')

  return (
    <div
      className={clsx(
        'rounded-lg border p-3 transition-all duration-300 relative',
        emergencyStop
          ? 'border-red-600 bg-[#1a1a2e]/50'
          : isRunning
            ? 'border-[#2a2a3e] bg-[#12121a]'
            : 'border-[#2a2a3e] bg-[#12121a] opacity-60',
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
        <div
          className={clsx(
            'w-2 h-2 rounded-full',
            isRunning ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-gray-600',
          )}
        />
        <span className="text-sm font-semibold text-[#e2e8f0]">{equipment.name}</span>
        {!isRunning && (
          <span className="text-[9px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded font-medium uppercase ml-auto">
            Offline
          </span>
        )}
      </div>

      {/* On/Off toggle */}
      <div className="flex items-center gap-3 mb-3">
        <button
          disabled={isDisabled}
          onClick={() => setPumpRunning(equipmentId, !pump.running)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            'border focus:outline-none',
            isDisabled && 'cursor-not-allowed opacity-50',
            isRunning
              ? 'bg-emerald-600/20 border-emerald-600 text-emerald-400 hover:bg-emerald-600/30'
              : 'bg-[#1a1a2e] border-[#2a2a3e] text-[#94a3b8] hover:bg-[#1a1a2e]/80',
          )}
        >
          <Power size={14} />
          {isRunning ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* RPM Slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">RPM</span>
          <span className="text-xs font-mono text-[#e2e8f0]">{Math.round(pump.targetRpm)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={3600}
          step={10}
          value={pump.targetRpm}
          disabled={isDisabled}
          onChange={(e) => setPumpRpm(equipmentId, Number(e.target.value))}
          className={clsx(
            'w-full h-1.5 rounded-full appearance-none cursor-pointer',
            'bg-[#1a1a2e] [&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#e2e8f0]',
            isDisabled && 'cursor-not-allowed opacity-50',
          )}
        />
        {/* RPM gauge bar */}
        <div className="h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden mt-1">
          <div
            className={clsx('h-full rounded-full transition-all duration-300', getRpmBarColor())}
            style={{ width: `${rpmPercent}%` }}
          />
        </div>
      </div>

      {/* Sensor readouts */}
      <div className="space-y-1.5">
        {vibSensor && (
          <QuickGauge
            label="Vibration"
            value={vibSensor.currentValue}
            min={vibSensor.config.min}
            max={vibSensor.config.max}
            unit={vibSensor.config.unit}
            normalMin={vibSensor.config.normalMin}
            normalMax={vibSensor.config.normalMax}
            warningMin={vibSensor.config.warningMin}
            warningMax={vibSensor.config.warningMax}
          />
        )}
        {tempSensor && (
          <QuickGauge
            label="Temperature"
            value={tempSensor.currentValue}
            min={tempSensor.config.min}
            max={tempSensor.config.max}
            unit={tempSensor.config.unit}
            normalMin={tempSensor.config.normalMin}
            normalMax={tempSensor.config.normalMax}
            warningMin={tempSensor.config.warningMin}
            warningMax={tempSensor.config.warningMax}
          />
        )}
      </div>
    </div>
  )
}

export default PumpControl
