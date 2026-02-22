'use client'

import { useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'

// Shared geometries
const POLE_GEO = new THREE.BoxGeometry(0.1, 2, 0.1)
const CLOTH_GEO = new THREE.BoxGeometry(0.8, 0.5, 0.05)
const RING_GEO = new THREE.RingGeometry(1, 1.5, 16)

// Shared materials
const POLE_MAT = new THREE.MeshLambertMaterial({ color: '#8B4513' })
const CLOTH_MAT = new THREE.MeshLambertMaterial({ color: '#FFD700' })
const RING_MAT = new THREE.MeshBasicMaterial({
  color: '#FFD700',
  transparent: true,
  opacity: 0.3,
  side: THREE.DoubleSide,
})

interface FlagModelProps {
  flagIndex: number
}

const FlagModel = memo(function FlagModel({ flagIndex }: FlagModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const clothRef = useRef<THREE.Mesh>(null)

  // Imperative updates - no React re-renders for position/visibility
  useFrame((_, delta) => {
    const flag = useGameStore.getState().flags[flagIndex]
    if (!flag || !groupRef.current) return

    const carried = flag.carriedBy !== null
    groupRef.current.visible = !carried

    if (!carried) {
      groupRef.current.position.set(
        flag.position[0],
        flag.position[1],
        flag.position[2]
      )
      if (clothRef.current) {
        clothRef.current.rotation.y += delta * 2
      }
    }
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 1, 0]} geometry={POLE_GEO} material={POLE_MAT} />
      <mesh ref={clothRef} position={[0.4, 1.7, 0]} geometry={CLOTH_GEO} material={CLOTH_MAT} />
      <mesh
        position={[0, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={RING_GEO}
        material={RING_MAT}
      />
    </group>
  )
})

export default FlagModel
