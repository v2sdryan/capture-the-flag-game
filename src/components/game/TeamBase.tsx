'use client'

import { Team } from '@/types/game'
import { RED_BASE, BLUE_BASE } from '@/lib/constants'

interface TeamBaseProps {
  team: Team
}

export default function TeamBase({ team }: TeamBaseProps) {
  const position = team === 'red' ? RED_BASE : BLUE_BASE
  const color = team === 'red' ? '#cc3333' : '#3333cc'
  const lightColor = team === 'red' ? '#ff4444' : '#4444ff'

  return (
    <group position={position}>
      {/* Base platform */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[8, 0.5, 8]} />
        <meshLambertMaterial color={color} />
      </mesh>

      {/* Corner pillars */}
      {[
        [-3.5, 2, -3.5],
        [3.5, 2, -3.5],
        [-3.5, 2, 3.5],
        [3.5, 2, 3.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[1, 4, 1]} />
          <meshLambertMaterial color={team === 'red' ? '#992222' : '#222299'} />
        </mesh>
      ))}

      {/* Banner between pillars */}
      <mesh position={[0, 3.5, -3.5]}>
        <boxGeometry args={[6, 1, 0.1]} />
        <meshLambertMaterial color={color} />
      </mesh>

      {/* Light - reduced for performance */}
      <pointLight position={[0, 4, 0]} color={lightColor} intensity={2} distance={10} />
    </group>
  )
}
