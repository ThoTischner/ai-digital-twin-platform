import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Vector3Tuple } from 'three'

interface PipeProps {
  from: Vector3Tuple
  to: Vector3Tuple
  waypoints?: Vector3Tuple[]
}

const PipeComponent: React.FC<PipeProps> = ({ from, to, waypoints }) => {
  const tubeGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [
      new THREE.Vector3(from[0], from[1] + 1, from[2]),
    ]

    if (waypoints) {
      for (const wp of waypoints) {
        points.push(new THREE.Vector3(wp[0], wp[1], wp[2]))
      }
    }

    points.push(new THREE.Vector3(to[0], to[1] + 1, to[2]))

    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
    return new THREE.TubeGeometry(curve, 64, 0.15, 8, false)
  }, [from, to, waypoints])

  return (
    <mesh geometry={tubeGeometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#6b7280"
        metalness={0.8}
        roughness={0.3}
      />
    </mesh>
  )
}

export const Pipe = React.memo(PipeComponent)
