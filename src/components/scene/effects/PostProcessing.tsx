import React from 'react'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export const PostProcessing: React.FC = () => {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.9}
      />
      <Vignette
        offset={0.3}
        darkness={0.6}
      />
    </EffectComposer>
  )
}
