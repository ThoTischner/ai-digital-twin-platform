import React from 'react'
import { Environment as DreiEnvironment } from '@react-three/drei'

export const Environment: React.FC = () => {
  return (
    <>
      <DreiEnvironment preset="warehouse" />

      {/* Main directional light */}
      <directionalLight
        position={[20, 30, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
      />

      {/* Fill light */}
      <directionalLight
        position={[-10, 15, -10]}
        intensity={0.4}
      />

      {/* Ambient light */}
      <ambientLight intensity={0.3} />

      {/* Fog */}
      <fog attach="fog" args={['#0a0a0f', 60, 120]} />
    </>
  )
}
