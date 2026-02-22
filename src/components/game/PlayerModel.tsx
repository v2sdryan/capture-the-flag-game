'use client'

import { useRef, useMemo, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Billboard, Text } from '@react-three/drei'
import { useGameStore } from '@/store/gameStore'

// Shared geometries - created once, reused by all 14 players
const BODY_GEO = new THREE.BoxGeometry(0.8, 1.2, 0.5)
const HEAD_GEO = new THREE.BoxGeometry(0.6, 0.6, 0.6)
const EYE_GEO = new THREE.BoxGeometry(0.1, 0.1, 0.01)
const LEG_GEO = new THREE.BoxGeometry(0.3, 0.8, 0.4)
const ARM_GEO = new THREE.BoxGeometry(0.3, 1.0, 0.4)
const FLAG_BOX_GEO = new THREE.BoxGeometry(0.8, 0.5, 0.05)
const FLAG_POLE_GEO = new THREE.BoxGeometry(0.05, 0.8, 0.05)
const STUN_GEO = new THREE.OctahedronGeometry(0.15)

// Shared materials for non-transparent parts
const EYE_MAT = new THREE.MeshBasicMaterial({ color: '#333333' })
const FLAG_GOLD_MAT = new THREE.MeshBasicMaterial({ color: '#FFD700' })
const FLAG_POLE_MAT = new THREE.MeshBasicMaterial({ color: '#8B4513' })
const STUN_MAT = new THREE.MeshBasicMaterial({ color: '#FFD700' })

interface PlayerModelProps {
  playerId: number
  isCurrentPlayer: boolean
}

const PlayerModel = memo(function PlayerModel({ playerId, isCurrentPlayer }: PlayerModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const flagGroupRef = useRef<THREE.Group>(null)
  const stunGroupRef = useRef<THREE.Group>(null)
  const stunMesh1Ref = useRef<THREE.Mesh>(null)
  const stunMesh2Ref = useRef<THREE.Mesh>(null)
  const stunMesh3Ref = useRef<THREE.Mesh>(null)

  // Read initial data (team/name are stable during gameplay)
  const initialPlayer = useGameStore.getState().players[playerId]
  const team = initialPlayer?.team ?? 'red'
  const name = initialPlayer?.name ?? ''

  // Per-player materials (need individual opacity control for stun effect)
  const materials = useMemo(() => {
    const bodyColor = team === 'red' ? '#cc3333' : '#3333cc'
    const legColor = team === 'red' ? '#992222' : '#222299'
    return {
      body: new THREE.MeshLambertMaterial({ color: bodyColor, transparent: true }),
      head: new THREE.MeshLambertMaterial({ color: '#f5c6a0', transparent: true }),
      legs: new THREE.MeshLambertMaterial({ color: legColor, transparent: true }),
    }
  }, [team])

  // Imperative updates via useFrame - no React re-renders
  useFrame((state) => {
    const player = useGameStore.getState().players[playerId]
    if (!player || !groupRef.current) return

    groupRef.current.position.set(
      player.position[0],
      player.position[1],
      player.position[2]
    )

    const opacity = player.stunned ? 0.4 : 1
    materials.body.opacity = opacity
    materials.head.opacity = opacity
    materials.legs.opacity = opacity

    if (flagGroupRef.current) {
      flagGroupRef.current.visible = player.hasFlag
    }

    if (stunGroupRef.current) {
      stunGroupRef.current.visible = player.stunned
      if (player.stunned) {
        const t = state.clock.elapsedTime * 3
        if (stunMesh1Ref.current) stunMesh1Ref.current.rotation.y = t
        if (stunMesh2Ref.current) stunMesh2Ref.current.rotation.y = t + 2
        if (stunMesh3Ref.current) stunMesh3Ref.current.rotation.y = t + 4
      }
    }
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.6, 0]} geometry={BODY_GEO} material={materials.body} />
      <mesh position={[0, 1.5, 0]} geometry={HEAD_GEO} material={materials.head} />
      <mesh position={[-0.15, 1.55, 0.31]} geometry={EYE_GEO} material={EYE_MAT} />
      <mesh position={[0.15, 1.55, 0.31]} geometry={EYE_GEO} material={EYE_MAT} />
      <mesh position={[-0.2, -0.2, 0]} geometry={LEG_GEO} material={materials.legs} />
      <mesh position={[0.2, -0.2, 0]} geometry={LEG_GEO} material={materials.legs} />
      <mesh position={[-0.6, 0.6, 0]} geometry={ARM_GEO} material={materials.body} />
      <mesh position={[0.6, 0.6, 0]} geometry={ARM_GEO} material={materials.body} />

      <group ref={flagGroupRef} visible={false}>
        <mesh position={[0, 2.3, -0.2]} geometry={FLAG_BOX_GEO} material={FLAG_GOLD_MAT} />
        <mesh position={[0, 2.0, -0.2]} geometry={FLAG_POLE_GEO} material={FLAG_POLE_MAT} />
      </group>

      <group ref={stunGroupRef} visible={false}>
        <mesh ref={stunMesh1Ref} position={[-0.3, 2.5, 0]} geometry={STUN_GEO} material={STUN_MAT} />
        <mesh ref={stunMesh2Ref} position={[0, 2.6, 0]} geometry={STUN_GEO} material={STUN_MAT} />
        <mesh ref={stunMesh3Ref} position={[0.3, 2.5, 0]} geometry={STUN_GEO} material={STUN_MAT} />
      </group>

      <Billboard position={[0, 2.8, 0]}>
        <Text
          fontSize={0.4}
          color={isCurrentPlayer ? '#FFD700' : '#ffffff'}
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  )
})

export default PlayerModel
