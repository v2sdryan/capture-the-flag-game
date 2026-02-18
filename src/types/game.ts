export type Team = 'red' | 'blue'

export type GamePhase = 'menu' | 'team-select' | 'playing' | 'shop' | 'game-over'

export type EquipmentSlot = 'boots' | 'armor' | 'weapon' | 'helmet'

export interface Equipment {
  id: string
  name: string
  slot: EquipmentSlot
  price: number
  speedBonus: number
  defenseBonus: number
  description: string
  icon: string
}

export interface Player {
  id: number
  team: Team
  name: string
  position: [number, number, number]
  hasFlag: boolean
  speed: number
  defense: number
  equipment: Partial<Record<EquipmentSlot, Equipment>>
  isBot: boolean
  targetPosition: [number, number, number] | null
  stunned: boolean
  stunTimer: number
}

export interface Flag {
  id: string
  position: [number, number, number]
  carriedBy: number | null
  team: Team | null
}

export interface GameState {
  phase: GamePhase
  playerTeam: Team | null
  playerId: number | null
  players: Player[]
  flags: Flag[]
  scores: Record<Team, number>
  timeRemaining: number
  money: number
  totalWins: number
  winner: Team | null
  mountainTop: [number, number, number]
}
