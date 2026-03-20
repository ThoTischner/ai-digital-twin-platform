import React from 'react'
import clsx from 'clsx'
import {
  Droplets,
  Container,
  Gauge,
  Filter,
  FlaskConical,
  Sun,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import { EQUIPMENT } from '../../config/plantLayout'
import { useSensorStore } from '../../engine/store/sensorStore'
import { useSceneStore } from '../../engine/store/sceneStore'
import { healthColors } from '../../utils/colors'
import { formatValue } from '../../utils/format'
import type { EquipmentType } from '../../types/equipment'
import type { HealthStatus } from '../../types/sensor'

const typeIcons: Record<EquipmentType, LucideIcon> = {
  pump: Droplets,
  tank: Container,
  valve: Gauge,
  filter: Filter,
  chemical_dosing: FlaskConical,
  uv_treatment: Sun,
  building: Warehouse,
}

export const HealthOverview: React.FC = () => {
  const sensors = useSensorStore((s) => s.sensors)
  const selectedId = useSceneStore((s) => s.selectedEquipmentId)
  const selectEquipment = useSceneStore((s) => s.selectEquipment)
  const setCameraPreset = useSceneStore((s) => s.setCameraPreset)

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {EQUIPMENT.map((eq) => {
        // Determine worst health across equipment sensors
        let worstHealth: HealthStatus = 'normal'
        let firstValue: string | null = null

        for (const sid of eq.sensorIds) {
          const s = sensors[sid]
          if (!s) continue
          if (firstValue === null) {
            firstValue = formatValue(s.currentValue, s.config.unit)
          }
          if (s.health === 'critical') worstHealth = 'critical'
          else if (s.health === 'warning' && worstHealth !== 'critical')
            worstHealth = 'warning'
        }

        const Icon = typeIcons[eq.type] ?? Warehouse
        const isSelected = selectedId === eq.id

        return (
          <button
            key={eq.id}
            onClick={() => {
              selectEquipment(eq.id)
              setCameraPreset('custom')
            }}
            className={clsx(
              'flex flex-col items-start p-2 rounded-lg border transition-colors text-left',
              'hover:bg-[#1e1e35]',
              isSelected
                ? 'bg-[#1e1e35] border-blue-500/50'
                : 'bg-[#1a1a2e] border-[#2a2a3e]',
            )}
          >
            <div className="flex items-center gap-1.5 w-full">
              <Icon size={12} className="text-[#94a3b8] shrink-0" />
              <span className="text-[10px] text-[#e2e8f0] font-medium truncate flex-1">
                {eq.name}
              </span>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: healthColors[worstHealth] }}
              />
            </div>
            {firstValue && (
              <span className="text-[10px] text-[#94a3b8] font-mono mt-1 ml-[18px]">
                {firstValue}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
