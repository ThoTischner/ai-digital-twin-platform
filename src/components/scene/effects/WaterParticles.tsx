import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PIPE_ROUTES, getEquipmentById } from '../../../config/plantLayout'
import { useSceneStore } from '../../../engine/store/sceneStore'

const PARTICLES_PER_ROUTE = 15

interface RouteData {
  curve: THREE.CatmullRomCurve3
  length: number
}

function buildRoutes(): RouteData[] {
  const routes: RouteData[] = []
  for (const route of PIPE_ROUTES) {
    const fromEq = getEquipmentById(route.from)
    const toEq = getEquipmentById(route.to)
    if (!fromEq || !toEq) continue

    const points: THREE.Vector3[] = [
      new THREE.Vector3(fromEq.position[0], fromEq.position[1] + 1, fromEq.position[2]),
    ]
    if (route.waypoints) {
      for (const wp of route.waypoints) {
        points.push(new THREE.Vector3(wp[0], wp[1], wp[2]))
      }
    }
    points.push(new THREE.Vector3(toEq.position[0], toEq.position[1] + 1, toEq.position[2]))

    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
    routes.push({ curve, length: curve.getLength() })
  }
  return routes
}

export const WaterParticles: React.FC = () => {
  const showParticles = useSceneStore((s) => s.showParticles)
  const pointsRef = useRef<THREE.Points>(null)

  const routes = useMemo(() => buildRoutes(), [])

  const totalParticles = routes.length * PARTICLES_PER_ROUTE

  const { positions, offsets } = useMemo(() => {
    const pos = new Float32Array(totalParticles * 3)
    const off = new Float32Array(totalParticles)

    let idx = 0
    for (let r = 0; r < routes.length; r++) {
      for (let p = 0; p < PARTICLES_PER_ROUTE; p++) {
        off[idx] = p / PARTICLES_PER_ROUTE
        const point = routes[r].curve.getPointAt(off[idx])
        pos[idx * 3] = point.x
        pos[idx * 3 + 1] = point.y
        pos[idx * 3 + 2] = point.z
        idx++
      }
    }

    return { positions: pos, offsets: off }
  }, [routes, totalParticles])

  const positionsAttr = useRef(positions)
  const offsetsRef = useRef(offsets)

  useFrame((_, delta) => {
    if (!pointsRef.current || !showParticles) return

    const geo = pointsRef.current.geometry
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
    const posArray = posAttr.array as Float32Array
    const speed = 0.15

    let idx = 0
    for (let r = 0; r < routes.length; r++) {
      const route = routes[r]
      for (let p = 0; p < PARTICLES_PER_ROUTE; p++) {
        offsetsRef.current[idx] += speed * delta
        if (offsetsRef.current[idx] > 1) {
          offsetsRef.current[idx] -= 1
        }

        const point = route.curve.getPointAt(offsetsRef.current[idx])
        posArray[idx * 3] = point.x
        posArray[idx * 3 + 1] = point.y
        posArray[idx * 3 + 2] = point.z
        idx++
      }
    }

    posAttr.needsUpdate = true
  })

  if (!showParticles) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={totalParticles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#38bdf8"
        size={0.15}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
