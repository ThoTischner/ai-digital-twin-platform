import React from 'react'
import { EquipmentConfig } from '../../../types/equipment'
import { useSceneStore } from '../../../engine/store/sceneStore'

interface SensorProps {
  config: EquipmentConfig
}

const ChemicalDosing: React.FC<{ config: EquipmentConfig }> = ({ config }) => {
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
      {/* Small chemical tank */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 2, 16]} />
        <meshStandardMaterial color="#7c3aed" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Tank cap */}
      <mesh castShadow position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.15, 16]} />
        <meshStandardMaterial color="#6d28d9" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Dosing pipe going down */}
      <mesh castShadow position={[0.5, 0.3, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

const UVTreatment: React.FC<{ config: EquipmentConfig }> = ({ config }) => {
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
      {/* Horizontal UV chamber */}
      <mesh castShadow receiveShadow position={[0, 1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.8, 0.8, 3, 24]} />
        <meshStandardMaterial
          color="#6366f1"
          metalness={0.6}
          roughness={0.3}
          emissive="#7c3aed"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* End caps */}
      <mesh castShadow position={[-1.6, 1, 0]}>
        <sphereGeometry args={[0.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4f46e5" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[1.6, 1, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4f46e5" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* UV glow indicator */}
      <pointLight position={[0, 1, 0]} color="#a78bfa" intensity={2} distance={5} />

      {/* Inlet pipe stub */}
      <mesh castShadow position={[-2.2, 1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 12]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Outlet pipe stub */}
      <mesh castShadow position={[2.2, 1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 12]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

const GenericSensor: React.FC<{ config: EquipmentConfig }> = ({ config }) => {
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
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

const SensorComponent: React.FC<SensorProps> = ({ config }) => {
  switch (config.type) {
    case 'chemical_dosing':
      return <ChemicalDosing config={config} />
    case 'uv_treatment':
      return <UVTreatment config={config} />
    default:
      return <GenericSensor config={config} />
  }
}

export const Sensor = React.memo(SensorComponent)
