import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneStore } from '../../engine/store/sceneStore'
import { lerp } from '../../utils/math'

const CAMERA_PRESETS: Record<string, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  overview: {
    position: new THREE.Vector3(0, 25, 40),
    target: new THREE.Vector3(5, 0, 0),
  },
  intake: {
    position: new THREE.Vector3(-15, 12, 15),
    target: new THREE.Vector3(-15, 0, 0),
  },
  treatment: {
    position: new THREE.Vector3(5, 12, 15),
    target: new THREE.Vector3(5, 0, 0),
  },
  distribution: {
    position: new THREE.Vector3(22, 12, 15),
    target: new THREE.Vector3(25, 0, 0),
  },
}

export const CameraController: React.FC = () => {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const cameraPreset = useSceneStore((s) => s.cameraPreset)
  const targetPosition = useRef(new THREE.Vector3(0, 25, 40))
  const targetLookAt = useRef(new THREE.Vector3(5, 0, 0))
  const isAnimating = useRef(false)

  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraPreset]
    if (preset) {
      targetPosition.current.copy(preset.position)
      targetLookAt.current.copy(preset.target)
      isAnimating.current = true
    }
  }, [cameraPreset])

  useFrame(() => {
    if (!isAnimating.current || !controlsRef.current) return

    const lerpFactor = 0.04

    camera.position.x = lerp(camera.position.x, targetPosition.current.x, lerpFactor)
    camera.position.y = lerp(camera.position.y, targetPosition.current.y, lerpFactor)
    camera.position.z = lerp(camera.position.z, targetPosition.current.z, lerpFactor)

    const controls = controlsRef.current
    controls.target.x = lerp(controls.target.x, targetLookAt.current.x, lerpFactor)
    controls.target.y = lerp(controls.target.y, targetLookAt.current.y, lerpFactor)
    controls.target.z = lerp(controls.target.z, targetLookAt.current.z, lerpFactor)

    controls.update()

    const dist = camera.position.distanceTo(targetPosition.current)
    if (dist < 0.1) {
      isAnimating.current = false
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      enablePan
      enableRotate
      enableZoom
      maxPolarAngle={Math.PI / 2.2}
      minDistance={5}
      maxDistance={80}
    />
  )
}
