import { create } from 'zustand'
import {
  GameState,
  GamePhase,
  Team,
  Player,
  Flag,
  Equipment,
} from '@/types/game'
import {
  GAME_DURATION,
  PLAYERS_PER_TEAM,
  WIN_REWARD,
  MOUNTAIN_TOP,
  FLAG_SPAWNS,
  PLAYER_BASE_SPEED,
  FLAG_CAPTURE_RADIUS,
  RED_BASE,
  BLUE_BASE,
  STUN_DURATION,
  TACKLE_RANGE,
} from '@/lib/constants'

function distance3D(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  )
}

function createPlayers(playerTeam: Team): Player[] {
  const players: Player[] = []

  for (let i = 0; i < PLAYERS_PER_TEAM; i++) {
    const isHuman = i === 0
    const base = RED_BASE
    players.push({
      id: i,
      team: 'red',
      name: isHuman && playerTeam === 'red' ? 'You' : `Red ${i + 1}`,
      position: [
        base[0] + (Math.random() - 0.5) * 8,
        base[1],
        base[2] + (Math.random() - 0.5) * 8,
      ],
      hasFlag: false,
      speed: PLAYER_BASE_SPEED,
      defense: 0,
      equipment: {},
      isBot: !(isHuman && playerTeam === 'red'),
      targetPosition: null,
      stunned: false,
      stunTimer: 0,
    })
  }

  for (let i = 0; i < PLAYERS_PER_TEAM; i++) {
    const isHuman = i === 0
    const base = BLUE_BASE
    players.push({
      id: PLAYERS_PER_TEAM + i,
      team: 'blue',
      name: isHuman && playerTeam === 'blue' ? 'You' : `Blue ${i + 1}`,
      position: [
        base[0] + (Math.random() - 0.5) * 8,
        base[1],
        base[2] + (Math.random() - 0.5) * 8,
      ],
      hasFlag: false,
      speed: PLAYER_BASE_SPEED,
      defense: 0,
      equipment: {},
      isBot: !(isHuman && playerTeam === 'blue'),
      targetPosition: null,
      stunned: false,
      stunTimer: 0,
    })
  }

  return players
}

function createFlags(): Flag[] {
  return FLAG_SPAWNS.map((pos, i) => ({
    id: `flag-${i}`,
    position: [...pos] as [number, number, number],
    carriedBy: null,
    team: null,
  }))
}

function getTerrainHeight(x: number, z: number): number {
  const distFromCenter = Math.sqrt(x * x + z * z)
  const mountainRadius = 15
  if (distFromCenter < mountainRadius) {
    const t = 1 - distFromCenter / mountainRadius
    return t * t * 20
  }
  return 0
}

interface GameActions {
  setPhase: (phase: GamePhase) => void
  selectTeam: (team: Team) => void
  startGame: () => void
  tick: () => void
  movePlayer: (direction: [number, number, number]) => void
  tryPickupFlag: () => void
  tryTackle: () => void
  buyEquipment: (equipment: Equipment) => void
  playAgain: () => void
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  phase: 'menu',
  playerTeam: null,
  playerId: null,
  players: [],
  flags: [],
  scores: { red: 0, blue: 0 },
  timeRemaining: GAME_DURATION,
  money: 0,
  totalWins: 0,
  winner: null,
  mountainTop: MOUNTAIN_TOP,

  setPhase: (phase) => set({ phase }),

  selectTeam: (team) => {
    const playerId = team === 'red' ? 0 : PLAYERS_PER_TEAM
    set({ playerTeam: team, playerId, phase: 'playing' })
    get().startGame()
  },

  startGame: () => {
    const state = get()
    const team = state.playerTeam
    if (!team) return

    set({
      players: createPlayers(team),
      flags: createFlags(),
      scores: { red: 0, blue: 0 },
      timeRemaining: GAME_DURATION,
      winner: null,
      phase: 'playing',
    })
  },

  tick: () => {
    const state = get()
    if (state.phase !== 'playing') return

    const newTimeRemaining = state.timeRemaining - 1 / 60

    if (newTimeRemaining <= 0) {
      const winner =
        state.scores.red > state.scores.blue
          ? 'red'
          : state.scores.blue > state.scores.red
          ? 'blue'
          : null
      const isWinner = winner === state.playerTeam
      set({
        timeRemaining: 0,
        phase: 'game-over',
        winner,
        money: state.money + (isWinner ? WIN_REWARD : 0),
        totalWins: state.totalWins + (isWinner ? 1 : 0),
      })
      return
    }

    const updatedPlayers = state.players.map((player) => {
      if (player.stunned) {
        const newStunTimer = player.stunTimer - 1
        if (newStunTimer <= 0) {
          return { ...player, stunned: false, stunTimer: 0 }
        }
        return { ...player, stunTimer: newStunTimer }
      }

      if (!player.isBot) return player

      return updateBot(player, state)
    })

    const updatedFlags = state.flags.map((flag) => {
      if (flag.carriedBy !== null) {
        const carrier = updatedPlayers.find((p) => p.id === flag.carriedBy)
        if (carrier) {
          return { ...flag, position: [...carrier.position] as [number, number, number] }
        }
      }
      return flag
    })

    let newScores = { ...state.scores }
    const finalPlayers = updatedPlayers.map((player) => {
      if (player.hasFlag) {
        const distToTop = distance3D(player.position as [number, number, number], MOUNTAIN_TOP)
        if (distToTop < FLAG_CAPTURE_RADIUS) {
          newScores = {
            ...newScores,
            [player.team]: newScores[player.team] + 1,
          }
          return { ...player, hasFlag: false }
        }
      }
      return player
    })

    const finalFlags = updatedFlags.map((flag) => {
      if (flag.carriedBy !== null) {
        const carrier = finalPlayers.find((p) => p.id === flag.carriedBy)
        if (carrier && !carrier.hasFlag) {
          return {
            ...flag,
            carriedBy: null,
            position: [...FLAG_SPAWNS[parseInt(flag.id.split('-')[1])]] as [number, number, number],
            team: null,
          }
        }
      }
      return flag
    })

    set({
      timeRemaining: newTimeRemaining,
      players: finalPlayers,
      flags: finalFlags,
      scores: newScores,
    })
  },

  movePlayer: (direction) => {
    const state = get()
    if (state.playerId === null || state.phase !== 'playing') return

    const player = state.players.find((p) => p.id === state.playerId)
    if (!player || player.stunned) return

    const speed = player.speed + getSpeedBonus(player)
    const newX = player.position[0] + direction[0] * speed
    const newZ = player.position[2] + direction[2] * speed
    const newY = getTerrainHeight(newX, newZ) + 0.5

    const clampedX = Math.max(-30, Math.min(30, newX))
    const clampedZ = Math.max(-30, Math.min(30, newZ))

    set({
      players: state.players.map((p) =>
        p.id === state.playerId
          ? { ...p, position: [clampedX, newY, clampedZ] as [number, number, number] }
          : p
      ),
    })
  },

  tryPickupFlag: () => {
    const state = get()
    if (state.playerId === null) return

    const player = state.players.find((p) => p.id === state.playerId)
    if (!player || player.hasFlag || player.stunned) return

    const nearbyFlag = state.flags.find(
      (f) =>
        f.carriedBy === null &&
        distance3D(player.position as [number, number, number], f.position) < FLAG_CAPTURE_RADIUS
    )

    if (nearbyFlag) {
      set({
        players: state.players.map((p) =>
          p.id === state.playerId ? { ...p, hasFlag: true } : p
        ),
        flags: state.flags.map((f) =>
          f.id === nearbyFlag.id
            ? { ...f, carriedBy: state.playerId, team: player.team }
            : f
        ),
      })
    }
  },

  tryTackle: () => {
    const state = get()
    if (state.playerId === null) return

    const player = state.players.find((p) => p.id === state.playerId)
    if (!player || player.stunned) return

    const tackleRange = TACKLE_RANGE + getTackleBonus(player)
    const enemies = state.players.filter(
      (p) =>
        p.team !== player.team &&
        p.hasFlag &&
        !p.stunned &&
        distance3D(
          player.position as [number, number, number],
          p.position as [number, number, number]
        ) < tackleRange
    )

    if (enemies.length > 0) {
      const target = enemies[0]
      set({
        players: state.players.map((p) => {
          if (p.id === target.id) {
            return {
              ...p,
              hasFlag: false,
              stunned: true,
              stunTimer: Math.max(10, STUN_DURATION - p.defense * 8),
            }
          }
          return p
        }),
        flags: state.flags.map((f) => {
          if (f.carriedBy === target.id) {
            return {
              ...f,
              carriedBy: null,
              team: null,
            }
          }
          return f
        }),
      })
    }
  },

  buyEquipment: (equipment) => {
    const state = get()
    if (state.money < equipment.price) return

    set({
      money: state.money - equipment.price,
      players: state.players.map((p) => {
        if (p.id === state.playerId) {
          return {
            ...p,
            equipment: { ...p.equipment, [equipment.slot]: equipment },
            speed: PLAYER_BASE_SPEED + equipment.speedBonus + getOtherSpeedBonus(p, equipment.slot),
            defense: equipment.defenseBonus + getOtherDefenseBonus(p, equipment.slot),
          }
        }
        return p
      }),
    })
  },

  playAgain: () => {
    set({ phase: 'team-select' })
  },
}))

function getSpeedBonus(player: Player): number {
  return Object.values(player.equipment).reduce(
    (sum, eq) => sum + (eq?.speedBonus ?? 0),
    0
  )
}

function getTackleBonus(player: Player): number {
  const weapon = player.equipment.weapon
  if (!weapon) return 0
  if (weapon.id === 'diamond-sword') return 3
  if (weapon.id === 'iron-sword') return 1.5
  return 0
}

function getOtherSpeedBonus(player: Player, excludeSlot: string): number {
  return Object.entries(player.equipment)
    .filter(([slot]) => slot !== excludeSlot)
    .reduce((sum, [, eq]) => sum + (eq?.speedBonus ?? 0), 0)
}

function getOtherDefenseBonus(player: Player, excludeSlot: string): number {
  return Object.entries(player.equipment)
    .filter(([slot]) => slot !== excludeSlot)
    .reduce((sum, [, eq]) => sum + (eq?.defenseBonus ?? 0), 0)
}

function updateBot(player: Player, state: GameState): Player {
  const speed = player.speed + getSpeedBonus(player)

  if (player.hasFlag) {
    const dir = [
      MOUNTAIN_TOP[0] - player.position[0],
      0,
      MOUNTAIN_TOP[2] - player.position[2],
    ]
    const len = Math.sqrt(dir[0] * dir[0] + dir[2] * dir[2])
    if (len > 0.1) {
      const newX = player.position[0] + (dir[0] / len) * speed
      const newZ = player.position[2] + (dir[2] / len) * speed
      const newY = getTerrainHeight(newX, newZ) + 0.5
      return {
        ...player,
        position: [
          Math.max(-30, Math.min(30, newX)),
          newY,
          Math.max(-30, Math.min(30, newZ)),
        ],
      }
    }
    return player
  }

  const enemyWithFlag = state.players.find(
    (p) => p.team !== player.team && p.hasFlag && !p.stunned
  )

  if (enemyWithFlag) {
    const dist = distance3D(
      player.position as [number, number, number],
      enemyWithFlag.position as [number, number, number]
    )
    if (dist < TACKLE_RANGE) {
      return player
    }
    const dir = [
      enemyWithFlag.position[0] - player.position[0],
      0,
      enemyWithFlag.position[2] - player.position[2],
    ]
    const len = Math.sqrt(dir[0] * dir[0] + dir[2] * dir[2])
    if (len > 0.1) {
      const newX = player.position[0] + (dir[0] / len) * speed * 0.8
      const newZ = player.position[2] + (dir[2] / len) * speed * 0.8
      const newY = getTerrainHeight(newX, newZ) + 0.5
      return {
        ...player,
        position: [
          Math.max(-30, Math.min(30, newX)),
          newY,
          Math.max(-30, Math.min(30, newZ)),
        ],
      }
    }
  }

  const availableFlag = state.flags.find(
    (f) => f.carriedBy === null
  )

  if (availableFlag) {
    const dir = [
      availableFlag.position[0] - player.position[0],
      0,
      availableFlag.position[2] - player.position[2],
    ]
    const len = Math.sqrt(dir[0] * dir[0] + dir[2] * dir[2])
    if (len > 0.1) {
      const newX = player.position[0] + (dir[0] / len) * speed
      const newZ = player.position[2] + (dir[2] / len) * speed
      const newY = getTerrainHeight(newX, newZ) + 0.5

      const newPos: [number, number, number] = [
        Math.max(-30, Math.min(30, newX)),
        newY,
        Math.max(-30, Math.min(30, newZ)),
      ]

      if (distance3D(newPos, availableFlag.position) < FLAG_CAPTURE_RADIUS) {
        return { ...player, position: newPos, hasFlag: true }
      }

      return { ...player, position: newPos }
    }
  }

  const wanderX = player.position[0] + (Math.random() - 0.5) * speed * 2
  const wanderZ = player.position[2] + (Math.random() - 0.5) * speed * 2
  const wanderY = getTerrainHeight(wanderX, wanderZ) + 0.5
  return {
    ...player,
    position: [
      Math.max(-30, Math.min(30, wanderX)),
      wanderY,
      Math.max(-30, Math.min(30, wanderZ)),
    ],
  }
}
