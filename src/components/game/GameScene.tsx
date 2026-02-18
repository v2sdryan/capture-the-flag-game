'use client'

import { useRef, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'
import VoxelTerrain from './VoxelTerrain'
import PlayerModel from './PlayerModel'
import FlagModel from './FlagModel'
import MountainTop from './MountainTop'
import TeamBase from './TeamBase'

function CameraController() {
  const { camera } = useThree()
  const playerId = useGameStore((s) => s.playerId)
  const players = useGameStore((s) => s.players)

  useFrame(() => {
    if (playerId === null) return
    const player = players.find((p) => p.id === playerId)
    if (!player) return

    const targetPos = new THREE.Vector3(
      player.position[0],
      player.position[1] + 15,
      player.position[2] + 15
    )
    camera.position.lerp(targetPos, 0.05)
    camera.lookAt(
      player.position[0],
      player.position[1],
      player.position[2]
    )
  })

  return null
}

function GameLoop() {
  const tick = useGameStore((s) => s.tick)
  const phase = useGameStore((s) => s.phase)
  const tryPickupFlag = useGameStore((s) => s.tryPickupFlag)
  const players = useGameStore((s) => s.players)
  const flags = useGameStore((s) => s.flags)

  useFrame(() => {
    if (phase !== 'playing') return
    tick()

    // Bot flag pickup logic
    for (const player of players) {
      if (player.isBot && !player.hasFlag && !player.stunned) {
        const nearbyFlag = flags.find((f) => {
          if (f.carriedBy !== null) return false
          const dx = f.position[0] - player.position[0]
          const dz = f.position[2] - player.position[2]
          return Math.sqrt(dx * dx + dz * dz) < 3
        })
        if (nearbyFlag) {
          useGameStore.setState((state) => ({
            players: state.players.map((p) =>
              p.id === player.id ? { ...p, hasFlag: true } : p
            ),
            flags: state.flags.map((f) =>
              f.id === nearbyFlag.id
                ? { ...f, carriedBy: player.id, team: player.team }
                : f
            ),
          }))
        }
      }

      // Bot tackle logic
      if (player.isBot && !player.stunned) {
        const enemy = players.find(
          (p) =>
            p.team !== player.team &&
            p.hasFlag &&
            !p.stunned &&
            Math.sqrt(
              (p.position[0] - player.position[0]) ** 2 +
              (p.position[2] - player.position[2]) ** 2
            ) < 3
        )
        if (enemy) {
          const flagIdx = flags.findIndex((f) => f.carriedBy === enemy.id)
          if (flagIdx >= 0) {
            useGameStore.setState((state) => ({
              players: state.players.map((p) => {
                if (p.id === enemy.id) {
                  return { ...p, hasFlag: false, stunned: true, stunTimer: 60 }
                }
                return p
              }),
              flags: state.flags.map((f) =>
                f.carriedBy === enemy.id
                  ? { ...f, carriedBy: null, team: null }
                  : f
              ),
            }))
          }
        }
      }
    }
  })

  return null
}

function InputHandler() {
  const keysRef = useRef<Set<string>>(new Set())
  const movePlayer = useGameStore((s) => s.movePlayer)
  const tryPickupFlag = useGameStore((s) => s.tryPickupFlag)
  const tryTackle = useGameStore((s) => s.tryTackle)
  const phase = useGameStore((s) => s.phase)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current.add(e.key.toLowerCase())

    if (e.key === 'e' || e.key === 'E') {
      tryPickupFlag()
    }
    if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
      tryTackle()
    }
  }, [tryPickupFlag, tryTackle])

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
    if (phase !== 'playing') return
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
      movePlayer(dir)
    }
  })

  return null
}

export default function GameScene() {
  const players = useGameStore((s) => s.players)
  const flags = useGameStore((s) => s.flags)
  const playerId = useGameStore((s) => s.playerId)
  const phase = useGameStore((s) => s.phase)

  if (phase !== 'playing') return null

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 30, 30], fov: 60 }}
        shadows
      >
        <Sky sunPosition={[100, 50, 100]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[50, 50, 50]}
          intensity={1}
          castShadow
        />

        <VoxelTerrain />
        <MountainTop />
        <TeamBase team="red" />
        <TeamBase team="blue" />

        {flags.map((flag) => (
          <FlagModel key={flag.id} flag={flag} />
        ))}

        {players.map((player) => (
          <PlayerModel
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === playerId}
          />
        ))}

        <CameraController />
        <GameLoop />
        <InputHandler />

        {/* Ground plane for areas outside terrain */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshLambertMaterial color="#5a8f4a" />
        </mesh>

        <fog attach="fog" args={['#87CEEB', 40, 80]} />
      </Canvas>
    </div>
  )
}
