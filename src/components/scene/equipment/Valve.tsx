import React from 'react'
import { EquipmentConfig } from '../../../types/equipment'
import { useSceneStore } from '../../../engine/store/sceneStore'

interface ValveProps {
  config: EquipmentConfig
}

const ValveComponent: React.FC<ValveProps> = ({ config }) => {
  const selectEquipment = useSceneStore((s) => s.selectEquipment)
  const hoverEquipment = useSceneStore((s) => s.hoverEquipment)

  return (
    <group
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
      {/* Central body - sphere */}
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Left pipe stub */}
      <mesh castShadow position={[-1, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 1, 12]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Right pipe stub */}
      <mesh castShadow position={[1, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 1, 12]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Handwheel on top */}
      <mesh castShadow position={[0, 1.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.06, 8, 24]} />
        <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Handwheel stem */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

export const Valve = React.memo(ValveComponent)
