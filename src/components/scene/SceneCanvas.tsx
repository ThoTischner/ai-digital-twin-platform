import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Environment } from './Environment'
import { CameraController } from './CameraController'
import { Tank } from './equipment/Tank'
import { Pump } from './equipment/Pump'
import { Valve } from './equipment/Valve'
import { Pipe } from './equipment/Pipe'
import { FilterUnit } from './equipment/FilterUnit'
import { Sensor } from './equipment/Sensor'
import { Building } from './equipment/Building'
import { HealthGlow } from './effects/HealthGlow'
import { WaterParticles } from './effects/WaterParticles'
import { PostProcessing } from './effects/PostProcessing'
import { FloatingLabel } from './indicators/FloatingLabel'
import { EQUIPMENT, PIPE_ROUTES, getEquipmentById } from '../../config/plantLayout'
import { EquipmentConfig, EquipmentType } from '../../types/equipment'

const EQUIPMENT_COMPONENTS: Record<EquipmentType, React.ComponentType<{ config: EquipmentConfig }>> = {
  tank: Tank,
  pump: Pump,
  valve: Valve,
  filter: FilterUnit,
  chemical_dosing: Sensor,
  uv_treatment: Sensor,
  building: Building,
}

function EquipmentRenderer({ config }: { config: EquipmentConfig }) {
  const Component = EQUIPMENT_COMPONENTS[config.type]
  if (!Component) return null
  return <Component config={config} />
}

function PipeNetwork() {
  return (
    <>
      {PIPE_ROUTES.map((route) => {
        const fromEq = getEquipmentById(route.from)
        const toEq = getEquipmentById(route.to)
        if (!fromEq || !toEq) return null
        return (
          <Pipe
            key={`${route.from}-${route.to}`}
            from={fromEq.position}
            to={toEq.position}
            waypoints={route.waypoints}
          />
        )
      })}
    </>
  )
}

function GroundPlane() {
  return (
    <mesh receiveShadow position={[5, -0.5, 0]} rotation={[0, 0, 0]}>
      <boxGeometry args={[80, 1, 40]} />
      <meshStandardMaterial color="#374151" roughness={0.9} metalness={0.1} />
    </mesh>
  )
}

export const SceneCanvas: React.FC = () => {
  return (
    <Canvas
      shadows
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      camera={{
        fov: 50,
        position: [0, 25, 40],
        near: 0.1,
        far: 500,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Environment />
        <CameraController />

        <GroundPlane />

        {EQUIPMENT.map((eq) => (
          <EquipmentRenderer key={eq.id} config={eq} />
        ))}

        <PipeNetwork />

        {EQUIPMENT.map((eq) => (
          <HealthGlow
            key={`glow-${eq.id}`}
            equipmentId={eq.id}
            position={eq.position}
          />
        ))}

        <WaterParticles />
        <PostProcessing />

        {EQUIPMENT.map((eq) => (
          <FloatingLabel
            key={`label-${eq.id}`}
            equipmentId={eq.id}
            position={[eq.position[0], eq.position[1] + 6, eq.position[2]]}
          />
        ))}

        <Building config={{
          id: 'B-001',
          name: 'Control Room',
          type: 'building',
          position: [0, 0, -10],
          sensorIds: [],
          connections: [],
          description: 'Main control room',
        }} />
      </Suspense>
    </Canvas>
  )
}
