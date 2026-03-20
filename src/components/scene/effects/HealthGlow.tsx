import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Vector3Tuple } from 'three'
import { useSensorStore } from '../../../engine/store/sensorStore'
import { healthColorsHex } from '../../../utils/colors'
import { HealthStatus } from '../../../types/sensor'

interface HealthGlowProps {
  equipmentId: string
  position: Vector3Tuple
}

function getWorstHealth(statuses: HealthStatus[]): HealthStatus {
  if (statuses.includes('critical')) return 'critical'
  if (statuses.includes('warning')) return 'warning'
  return 'normal'
}

const HealthGlowComponent: React.FC<HealthGlowProps> = ({ equipmentId, position }) => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const healthRef = useRef<HealthStatus>('normal')

  const sensorIds = useMemo(() => {
    const sensors = useSensorStore.getState().sensors
    return Object.values(sensors)
      .filter((s) => s.config.equipmentId === equipmentId)
      .map((s) => s.config.id)
  }, [equipmentId])

  useFrame((state) => {
    if (!materialRef.current || sensorIds.length === 0) return

    const sensors = useSensorStore.getState().sensors
    const statuses = sensorIds.map((id) => sensors[id]?.health ?? 'normal')
    const worstHealth = getWorstHealth(statuses)
    healthRef.current = worstHealth

    const mat = materialRef.current
    const color = healthColorsHex[worstHealth]
    mat.emissive.setHex(color)

    const t = state.clock.elapsedTime

    switch (worstHealth) {
      case 'normal':
        mat.emissiveIntensity = 0.3
        break
      case 'warning':
        mat.emissiveIntensity = 0.4 + Math.sin(t * 3) * 0.3
        break
      case 'critical':
        mat.emissiveIntensity = 0.5 + Math.sin(t * 8) * 0.5
        break
    }

    mat.opacity = 0.3 + mat.emissiveIntensity * 0.3
  })

  if (sensorIds.length === 0) return null

  return (
    <mesh
      position={[position[0], 0.05, position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[1.5, 2.2, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#000000"
        emissive="#10b981"
        emissiveIntensity={0.3}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export const HealthGlow = React.memo(HealthGlowComponent)
