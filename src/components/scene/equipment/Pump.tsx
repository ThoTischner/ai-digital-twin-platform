import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EquipmentConfig } from '../../../types/equipment'
import { useSensorStore } from '../../../engine/store/sensorStore'
import { useSceneStore } from '../../../engine/store/sceneStore'

interface PumpProps {
  config: EquipmentConfig
}

const PumpComponent: React.FC<PumpProps> = ({ config }) => {
  const selectEquipment = useSceneStore((s) => s.selectEquipment)
  const hoverEquipment = useSceneStore((s) => s.hoverEquipment)
  const shaftRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  const rpmSensorId = useMemo(
    () => config.sensorIds.find((id) => id.includes('RPM')),
    [config.sensorIds],
  )

  const vibSensorId = useMemo(
    () => config.sensorIds.find((id) => id.includes('VIB')),
    [config.sensorIds],
  )

  useFrame((state) => {
    const sensors = useSensorStore.getState().sensors

    // Shaft rotation based on RPM
    if (shaftRef.current && rpmSensorId) {
      const rpmSensor = sensors[rpmSensorId]
      if (rpmSensor) {
        const rpm = rpmSensor.currentValue
        const radiansPerSecond = (rpm / 60) * Math.PI * 2
        shaftRef.current.rotation.x += radiansPerSecond * 0.016
      }
    }

    // Vibration displacement
    if (groupRef.current && vibSensorId) {
      const vibSensor = sensors[vibSensorId]
      if (vibSensor) {
        const vibration = vibSensor.currentValue
        const amplitude = vibration * 0.002
        const frequency = 15
        const t = state.clock.elapsedTime
        groupRef.current.position.y = config.position[1] + Math.sin(t * frequency) * amplitude
        groupRef.current.position.x = config.position[0] + Math.cos(t * frequency * 0.7) * amplitude * 0.5
      }
    }
  })

  return (
    <group
      ref={groupRef}
      position={config.position}
      rotation={config.rotation ?? [0, 0, 0]}
      scale={config.scale ?? [1, 1, 1]}
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
      {/* Main body - horizontal cylinder */}
      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 2, 24]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Motor box on top */}
      <mesh castShadow receiveShadow position={[0, 1.8, 0]}>
        <boxGeometry args={[1, 1, 1.5]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Rotating shaft indicator */}
      <mesh ref={shaftRef} castShadow position={[0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 12]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Inlet pipe stub (left) */}
      <mesh castShadow position={[-1.5, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 1, 12]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Outlet pipe stub (right) */}
      <mesh castShadow position={[1.5, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 1, 12]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Base/feet */}
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[2.5, 0.1, 1.8]} />
        <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  )
}

export const Pump = React.memo(PumpComponent)
