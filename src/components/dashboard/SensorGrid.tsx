import React from 'react'
import clsx from 'clsx'
import { SENSORS } from '../../config/sensorConfig'
import { useSensorStore } from '../../engine/store/sensorStore'
import { useSceneStore } from '../../engine/store/sceneStore'
import { healthColors } from '../../utils/colors'
import { SensorChart } from './SensorChart'

export const SensorGrid: React.FC = () => {
  const sensors = useSensorStore((s) => s.sensors)
  const selectEquipment = useSceneStore((s) => s.selectEquipment)

  return (
    <div className="grid grid-cols-2 gap-2">
      {SENSORS.map((cfg) => {
        const state = sensors[cfg.id]
        const health = state?.health ?? 'normal'
        const isAnomalous = health !== 'normal'
        const borderColor = isAnomalous ? healthColors[health] : undefined

        return (
          <div
            key={cfg.id}
            onClick={() => selectEquipment(cfg.equipmentId)}
            className={clsx(
              'bg-[#1a1a2e] rounded-lg p-2 border cursor-pointer transition-colors',
              'hover:bg-[#1e1e35]',
              isAnomalous ? 'border-opacity-80' : 'border-[#2a2a3e]',
            )}
            style={isAnomalous ? { borderColor } : undefined}
          >
            <SensorChart sensorId={cfg.id} />
          </div>
        )
      })}
    </div>
  )
}
