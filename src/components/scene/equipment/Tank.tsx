import React, { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { EquipmentConfig } from '../../../types/equipment'
import { useSensorStore } from '../../../engine/store/sensorStore'
import { useSceneStore } from '../../../engine/store/sceneStore'

interface TankProps {
  config: EquipmentConfig
}

const TankComponent: React.FC<TankProps> = ({ config }) => {
  const selectEquipment = useSceneStore((s) => s.selectEquipment)
  const hoverEquipment = useSceneStore((s) => s.hoverEquipment)
  const scale = config.scale ?? [1, 1, 1]

  // Find level sensor for this tank
  const levelSensorId = useMemo(() => {
    return config.sensorIds.find((id) => id.includes('LVL'))
  }, [config.sensorIds])

  const waterLevelRef = React.useRef(0.5)

  useFrame(() => {
    if (!levelSensorId) return
    const sensor = useSensorStore.getState().sensors[levelSensorId]
    if (sensor) {
      // Normalize to 0-1 range
      waterLevelRef.current = sensor.currentValue / 100
    }
  })

  const [waterHeight, setWaterHeight] = React.useState(0.5)

  useFrame(() => {
    setWaterHeight(waterLevelRef.current)
  })

  const bodyRadius = 2
  const bodyHeight = 4
  const waterH = waterHeight * bodyHeight * 0.85

  return (
    <group
      position={config.position}
      rotation={config.rotation ?? [0, 0, 0]}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation()
        selectEquipment(config.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        hoverEquipment(config.id)
      }}
      onPointerOut={() => hoverEquipment(null)}
    >
      {/* Main body cylinder */}
      <mesh castShadow receiveShadow position={[0, bodyHeight / 2, 0]}>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 32]} />
        <meshStandardMaterial
          color="#4a5568"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Dome top */}
      <mesh castShadow position={[0, bodyHeight, 0]}>
        <sphereGeometry args={[bodyRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#4a5568"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Water level indicator */}
      {levelSensorId && waterH > 0.01 && (
        <mesh position={[0, waterH / 2 + 0.1, 0]}>
          <cylinderGeometry args={[bodyRadius - 0.15, bodyRadius - 0.15, waterH, 32]} />
          <meshStandardMaterial
            color="#0ea5e9"
            opacity={0.6}
            transparent
            metalness={0.1}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* Legs */}
      {[
        [1.2, 0, 1.2],
        [-1.2, 0, 1.2],
        [1.2, 0, -1.2],
        [-1.2, 0, -1.2],
      ].map((pos, i) => (
        <mesh key={i} castShadow position={[pos[0], -0.15, pos[2]]}>
          <cylinderGeometry args={[0.12, 0.12, 0.4, 8]} />
          <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export const Tank = React.memo(TankComponent)
