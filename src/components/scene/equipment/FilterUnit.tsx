import React from 'react'
import { EquipmentConfig } from '../../../types/equipment'
import { useSceneStore } from '../../../engine/store/sceneStore'

interface FilterUnitProps {
  config: EquipmentConfig
}

const FilterUnitComponent: React.FC<FilterUnitProps> = ({ config }) => {
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
      {/* Main body - vertical cylinder */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 3, 24]} />
        <meshStandardMaterial color="#4b5563" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Top cap */}
      <mesh castShadow position={[0, 3.1, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.2, 24]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Bottom cap */}
      <mesh castShadow position={[0, -0.1, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.2, 24]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Inlet pipe stub (left side) */}
      <mesh castShadow position={[-1.6, 2.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 12]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Outlet pipe stub (right side) */}
      <mesh castShadow position={[1.6, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 12]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Pressure gauge face - inlet side */}
      <mesh position={[-1.25, 2.2, 0.4]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Pressure gauge face - outlet side */}
      <mesh position={[1.25, 0.8, 0.4]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.3} roughness={0.6} />
      </mesh>
    </group>
  )
}

export const FilterUnit = React.memo(FilterUnitComponent)
