import React from 'react'
import clsx from 'clsx'
import { Filter } from 'lucide-react'
import { useControlStore } from '../../engine/store/controlStore'
import { useSensorStore } from '../../engine/store/sensorStore'
import { getEquipmentById } from '../../config/plantLayout'
import QuickGauge from './QuickGauge'

interface FilterControlProps {
  equipmentId: string
}

const FilterControl: React.FC<FilterControlProps> = ({ equipmentId }) => {
  const equipment = getEquipmentById(equipmentId)
  const filter = useControlStore((s) => s.filters[equipmentId])
  const filters = useControlStore((s) => s.filters)
  const mode = useControlStore((s) => s.mode)
  const setFilterActive = useControlStore((s) => s.setFilterActive)
  const setFilterBackwash = useControlStore((s) => s.setFilterBackwash)
  const sensors = useSensorStore((s) => s.sensors)

  if (!filter || !equipment) return null

  const isDisabled = mode === 'auto'

  const pressureSensor = filter.pressureSensorId ? sensors[filter.pressureSensorId] : null
  const flowSensor = filter.flowSensorId ? sensors[filter.flowSensorId] : null

  // Find the other filter for "Switch to Backup"
  const otherFilterId = Object.keys(filters).find((id) => id !== equipmentId)

  const handleSwitchToBackup = () => {
    if (otherFilterId) {
      setFilterActive(equipmentId, false)
      setFilterActive(otherFilterId, true)
    }
  }

  // Pressure differential color
  const getPressureColor = () => {
    if (!pressureSensor) return 'text-[#94a3b8]'
    const v = pressureSensor.currentValue
    const cfg = pressureSensor.config
    if (v >= cfg.normalMin && v <= cfg.normalMax) return 'text-emerald-400'
    if (v >= cfg.warningMin && v <= cfg.warningMax) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div
      className={clsx(
        'rounded-lg border p-3 transition-all duration-300 relative',
        filter.backwashMode
          ? 'border-amber-600/50 bg-[#12121a]'
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
        <Filter size={14} className="text-cyan-400" />
        <span className="text-sm font-semibold text-[#e2e8f0]">{equipment.name}</span>
      </div>

      {/* Active / Standby toggle */}
      <div className="flex items-center gap-3 mb-3">
        <button
          disabled={isDisabled}
          onClick={() => setFilterActive(equipmentId, !filter.active)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            'border focus:outline-none',
            isDisabled && 'cursor-not-allowed opacity-50',
            filter.active
              ? 'bg-emerald-600/20 border-emerald-600 text-emerald-400'
              : 'bg-[#1a1a2e] border-[#2a2a3e] text-[#94a3b8] hover:bg-[#1a1a2e]/80',
          )}
        >
          {filter.active ? 'Active' : 'Standby'}
        </button>

        {/* Backwash toggle */}
        <button
          disabled={isDisabled}
          onClick={() => setFilterBackwash(equipmentId, !filter.backwashMode)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            'border focus:outline-none',
            isDisabled && 'cursor-not-allowed opacity-50',
            filter.backwashMode
              ? 'bg-amber-600/20 border-amber-600 text-amber-400 animate-pulse'
              : 'bg-[#1a1a2e] border-[#2a2a3e] text-[#94a3b8] hover:bg-[#1a1a2e]/80',
          )}
        >
          Backwash {filter.backwashMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Sensor readouts */}
      <div className="space-y-1.5 mb-3">
        {pressureSensor && (
          <QuickGauge
            label="Pressure"
            value={pressureSensor.currentValue}
            min={pressureSensor.config.min}
            max={pressureSensor.config.max}
            unit={pressureSensor.config.unit}
            normalMin={pressureSensor.config.normalMin}
            normalMax={pressureSensor.config.normalMax}
            warningMin={pressureSensor.config.warningMin}
            warningMax={pressureSensor.config.warningMax}
          />
        )}
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
        {pressureSensor && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#94a3b8] w-20 shrink-0">Pressure</span>
            <span className={clsx('font-mono', getPressureColor())}>
              {pressureSensor.currentValue.toFixed(1)} {pressureSensor.config.unit}
            </span>
          </div>
        )}
      </div>

      {/* Switch to Backup */}
      {otherFilterId && (
        <button
          disabled={isDisabled}
          onClick={handleSwitchToBackup}
          className={clsx(
            'w-full text-[10px] font-semibold py-1.5 rounded border transition-all',
            'focus:outline-none uppercase tracking-wider',
            isDisabled
              ? 'cursor-not-allowed opacity-50 bg-[#1a1a2e] border-[#2a2a3e] text-[#94a3b8]'
              : 'bg-cyan-600/10 border-cyan-600/30 text-cyan-400 hover:bg-cyan-600/20 cursor-pointer',
          )}
        >
          Switch to Backup
        </button>
      )}
    </div>
  )
}

export default FilterControl
