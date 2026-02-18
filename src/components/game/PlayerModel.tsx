'use client'

import { useRef } from 'react'
import { Mesh } from 'three'
import { Billboard, Text } from '@react-three/drei'
import { Player } from '@/types/game'

interface PlayerModelProps {
  player: Player
  isCurrentPlayer: boolean
}

export default function PlayerModel({ player, isCurrentPlayer }: PlayerModelProps) {
  const meshRef = useRef<Mesh>(null)

  const bodyColor = player.team === 'red' ? '#cc3333' : '#3333cc'
  const headColor = '#f5c6a0'
  const opacity = player.stunned ? 0.4 : 1

  return (
    <group position={player.position}>
      {/* Body */}
      <mesh ref={meshRef} position={[0, 0.6, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshLambertMaterial color={bodyColor} transparent opacity={opacity} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshLambertMaterial color={headColor} transparent opacity={opacity} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.15, 1.55, 0.31]}>
        <boxGeometry args={[0.1, 0.1, 0.01]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      <mesh position={[0.15, 1.55, 0.31]}>
        <boxGeometry args={[0.1, 0.1, 0.01]} />
        <meshBasicMaterial color="#333" />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.2, -0.2, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.4]} />
        <meshLambertMaterial color={player.team === 'red' ? '#992222' : '#222299'} transparent opacity={opacity} />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.2, -0.2, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.4]} />
        <meshLambertMaterial color={player.team === 'red' ? '#992222' : '#222299'} transparent opacity={opacity} />
      </mesh>

      {/* Left arm */}
      <mesh position={[-0.6, 0.6, 0]}>
        <boxGeometry args={[0.3, 1.0, 0.4]} />
        <meshLambertMaterial color={bodyColor} transparent opacity={opacity} />
      </mesh>

      {/* Right arm */}
      <mesh position={[0.6, 0.6, 0]}>
        <boxGeometry args={[0.3, 1.0, 0.4]} />
        <meshLambertMaterial color={bodyColor} transparent opacity={opacity} />
      </mesh>

      {/* Flag indicator */}
      {player.hasFlag && (
        <mesh position={[0, 2.3, -0.2]}>
          <boxGeometry args={[0.8, 0.5, 0.05]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      )}

      {/* Flag pole */}
      {player.hasFlag && (
        <mesh position={[0, 2.0, -0.2]}>
          <boxGeometry args={[0.05, 0.8, 0.05]} />
          <meshBasicMaterial color="#8B4513" />
        </mesh>
      )}

      {/* Stun stars */}
      {player.stunned && (
        <Billboard position={[0, 2.5, 0]}>
          <Text fontSize={0.5} color="#FFD700">
            ★★★
          </Text>
        </Billboard>
      )}

      {/* Name tag */}
      <Billboard position={[0, 2.8, 0]}>
        <Text
          fontSize={0.4}
          color={isCurrentPlayer ? '#FFD700' : '#ffffff'}
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {player.name}
        </Text>
      </Billboard>
    </group>
  )
}
