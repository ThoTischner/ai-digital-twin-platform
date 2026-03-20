import React from 'react'
import { Html } from '@react-three/drei'
import { Vector3Tuple } from 'three'
import { useSensorStore } from '../../../engine/store/sensorStore'
import { useSceneStore } from '../../../engine/store/sceneStore'
import { getEquipmentById } from '../../../config/plantLayout'
import { formatValue } from '../../../utils/format'
import { healthColors } from '../../../utils/colors'

interface FloatingLabelProps {
  equipmentId: string
  position: Vector3Tuple
}

const FloatingLabelComponent: React.FC<FloatingLabelProps> = ({ equipmentId, position }) => {
  const showLabels = useSceneStore((s) => s.showLabels)
  const selectedId = useSceneStore((s) => s.selectedEquipmentId)
  const hoveredId = useSceneStore((s) => s.hoveredEquipmentId)
  const sensors = useSensorStore((s) => s.sensors)

  const equipment = getEquipmentById(equipmentId)
  if (!equipment) return null

  const isVisible = showLabels || selectedId === equipmentId || hoveredId === equipmentId
  if (!isVisible) return null

  // Get sensors for this equipment
  const equipmentSensors = Object.values(sensors).filter(
    (s) => s.config.equipmentId === equipmentId,
  )

  // Find worst health
  let worstHealth: 'normal' | 'warning' | 'critical' = 'normal'
  for (const s of equipmentSensors) {
    if (s.health === 'critical') {
      worstHealth = 'critical'
      break
    }
    if (s.health === 'warning') worstHealth = 'warning'
  }

  // Pick key sensor to display
  const keySensor = equipmentSensors[0]

  return (
    <Html
      position={position}
      center
      distanceFactor={20}
      style={{ pointerEvents: 'none' }}
    >
      <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 min-w-[120px] text-center select-none">
        <div className="text-xs font-semibold text-gray-200 truncate">
          {equipment.name}
        </div>
        {keySensor && (
          <div className="text-xs text-gray-400 mt-0.5">
            {formatValue(keySensor.currentValue, keySensor.config.unit)}
          </div>
        )}
        {equipmentSensors.length > 0 && (
          <div className="mt-1 flex justify-center">
            <span
              className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium uppercase"
              style={{
                backgroundColor: healthColors[worstHealth] + '22',
                color: healthColors[worstHealth],
                border: `1px solid ${healthColors[worstHealth]}44`,
              }}
            >
              {worstHealth}
            </span>
          </div>
        )}
      </div>
    </Html>
  )
}

export const FloatingLabel = React.memo(FloatingLabelComponent)
