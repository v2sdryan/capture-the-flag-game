'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { Flag } from '@/types/game'

interface FlagModelProps {
  flag: Flag
}

export default function FlagModel({ flag }: FlagModelProps) {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current && flag.carriedBy === null) {
      meshRef.current.rotation.y += delta * 2
    }
  })

  if (flag.carriedBy !== null) return null

  return (
    <group position={flag.position}>
      {/* Pole */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.1, 2, 0.1]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Flag cloth */}
      <mesh ref={meshRef} position={[0.4, 1.7, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>

      {/* Glow ring */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1, 1.5, 16]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
      </mesh>

      {/* Beacon light */}
      <pointLight position={[0, 2, 0]} color="#FFD700" intensity={2} distance={10} />
    </group>
  )
}
