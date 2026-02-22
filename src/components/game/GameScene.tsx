'use client'

import { useRef, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'
import VoxelTerrain from './VoxelTerrain'
import PlayerModel from './PlayerModel'
import FlagModel from './FlagModel'
import MountainTop from './MountainTop'
import TeamBase from './TeamBase'
import { PLAYERS_PER_TEAM, FLAG_SPAWNS } from '@/lib/constants'

// Pre-allocated vectors to avoid per-frame GC pressure
const _targetPos = new THREE.Vector3()
const _lookAt = new THREE.Vector3()

function CameraController() {
  const { camera } = useThree()

  useFrame(() => {
    const state = useGameStore.getState()
    if (state.playerId === null) return
    const player = state.players[state.playerId]
    if (!player) return

    _targetPos.set(
      player.position[0],
      player.position[1] + 15,
      player.position[2] + 15
    )
    camera.position.lerp(_targetPos, 0.05)
    _lookAt.set(player.position[0], player.position[1], player.position[2])
    camera.lookAt(_lookAt)
  })

  return null
}

function GameLoop() {
  useFrame(() => {
    const state = useGameStore.getState()
    if (state.phase !== 'playing') return
    state.tick()

    const { players, flags } = useGameStore.getState()
    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      if (!player.isBot || player.stunned) continue

      // Bot flag pickup - use squared distance to avoid sqrt
      if (!player.hasFlag) {
        let nearbyFlagId: string | null = null
        for (let j = 0; j < flags.length; j++) {
          const f = flags[j]
          if (f.carriedBy !== null) continue
          const dx = f.position[0] - player.position[0]
          const dz = f.position[2] - player.position[2]
          if (dx * dx + dz * dz < 9) {
            nearbyFlagId = f.id
            break
          }
        }
        if (nearbyFlagId) {
          const fid = nearbyFlagId
          useGameStore.setState((s) => ({
            players: s.players.map((p) =>
              p.id === player.id ? { ...p, hasFlag: true } : p
            ),
            flags: s.flags.map((f) =>
              f.id === fid
                ? { ...f, carriedBy: player.id, team: player.team }
                : f
            ),
          }))
        }
      }

      // Bot tackle - use squared distance
      let enemyId: number | null = null
      for (let j = 0; j < players.length; j++) {
        const p = players[j]
        if (p.team === player.team || !p.hasFlag || p.stunned) continue
        const dx = p.position[0] - player.position[0]
        const dz = p.position[2] - player.position[2]
        if (dx * dx + dz * dz < 9) {
          enemyId = p.id
          break
        }
      }
      if (enemyId !== null) {
        const eid = enemyId
        useGameStore.setState((s) => ({
          players: s.players.map((p) =>
            p.id === eid
              ? { ...p, hasFlag: false, stunned: true, stunTimer: 60 }
              : p
          ),
          flags: s.flags.map((f) =>
            f.carriedBy === eid ? { ...f, carriedBy: null, team: null } : f
          ),
        }))
      }
    }
  })

  return null
}

function InputHandler() {
  const keysRef = useRef<Set<string>>(new Set())

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current.add(e.key.toLowerCase())
    if (e.key === 'e' || e.key === 'E') {
      useGameStore.getState().tryPickupFlag()
    }
    if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
      useGameStore.getState().tryTackle()
    }
  }, [])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.key.toLowerCase())
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  useFrame(() => {
    if (useGameStore.getState().phase !== 'playing') return
    const keys = keysRef.current
    const dir: [number, number, number] = [0, 0, 0]

    if (keys.has('w') || keys.has('arrowup')) dir[2] -= 1
    if (keys.has('s') || keys.has('arrowdown')) dir[2] += 1
    if (keys.has('a') || keys.has('arrowleft')) dir[0] -= 1
    if (keys.has('d') || keys.has('arrowright')) dir[0] += 1

    if (dir[0] !== 0 || dir[2] !== 0) {
      const len = Math.sqrt(dir[0] * dir[0] + dir[2] * dir[2])
      dir[0] /= len
      dir[2] /= len
      useGameStore.getState().movePlayer(dir)
    }
  })

  return null
}

// Static IDs - avoids subscribing to players/flags arrays
const PLAYER_IDS = Array.from({ length: PLAYERS_PER_TEAM * 2 }, (_, i) => i)
const FLAG_INDICES = Array.from({ length: FLAG_SPAWNS.length }, (_, i) => i)

export default function GameScene() {
  const phase = useGameStore((s) => s.phase)
  const playerId = useGameStore((s) => s.playerId)

  if (phase !== 'playing') return null

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 30, 30], fov: 60 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <color attach="background" args={['#87CEEB']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[50, 50, 50]} intensity={1.2} />

        <VoxelTerrain />
        <MountainTop />
        <TeamBase team="red" />
        <TeamBase team="blue" />

        {FLAG_INDICES.map((i) => (
          <FlagModel key={i} flagIndex={i} />
        ))}

        {PLAYER_IDS.map((id) => (
          <PlayerModel
            key={id}
            playerId={id}
            isCurrentPlayer={id === playerId}
          />
        ))}

        <CameraController />
        <GameLoop />
        <InputHandler />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshLambertMaterial color="#5a8f4a" />
        </mesh>

        <fog attach="fog" args={['#87CEEB', 50, 90]} />
      </Canvas>
    </div>
  )
}
