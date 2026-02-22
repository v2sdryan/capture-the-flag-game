'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { MOUNTAIN_TOP } from '@/lib/constants'

export default function MountainTop() {
  const ringRef = useRef<Mesh>(null)
  const beaconRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
    if (beaconRef.current) {
      beaconRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }
  })

  return (
    <group position={MOUNTAIN_TOP}>
      {/* Goal platform */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[3, 3, 0.2, 8]} />
        <meshLambertMaterial color="#DAA520" />
      </mesh>

      {/* Rotating ring */}
      <mesh ref={ringRef} position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.15, 8, 16]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>

      {/* Beacon pillar */}
      <mesh ref={beaconRef} position={[0, 5, 0]}>
        <cylinderGeometry args={[0.1, 0.3, 10, 6]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
      </mesh>

      {/* Light - reduced intensity/distance for performance */}
      <pointLight position={[0, 3, 0]} color="#FFD700" intensity={3} distance={20} />

      {/* Flag pole at summit */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.15, 3, 0.15]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Summit flag */}
      <mesh position={[0.5, 2.7, 0]}>
        <boxGeometry args={[1, 0.6, 0.05]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  )
}
