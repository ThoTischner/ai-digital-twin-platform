import React from 'react'
import { EquipmentConfig } from '../../../types/equipment'

interface BuildingProps {
  config: EquipmentConfig
}

const BuildingComponent: React.FC<BuildingProps> = ({ config }) => {
  const pos = config.position

  return (
    <group position={pos}>
      {/* Main building body */}
      <mesh castShadow receiveShadow position={[0, 2, 0]}>
        <boxGeometry args={[8, 4, 5]} />
        <meshStandardMaterial color="#374151" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Roof */}
      <mesh castShadow position={[0, 4.2, 0]}>
        <boxGeometry args={[8.5, 0.4, 5.5]} />
        <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.7} />
      </mesh>

      {/* Front windows */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <mesh key={`fw-${i}`} position={[x, 2.5, 2.55]}>
          <planeGeometry args={[1.2, 1]} />
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
            metalness={0.1}
            roughness={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Side windows */}
      {[-1.5, 1.5].map((z, i) => (
        <mesh key={`sw-${i}`} position={[4.05, 2.5, z]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
            metalness={0.1}
            roughness={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Door */}
      <mesh position={[0, 1, 2.55]}>
        <planeGeometry args={[1.2, 2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Interior light glow */}
      <pointLight position={[0, 3, 0]} color="#fbbf24" intensity={3} distance={8} />
    </group>
  )
}

export const Building = React.memo(BuildingComponent)
