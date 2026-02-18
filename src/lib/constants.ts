import { Equipment } from '@/types/game'

export const GAME_DURATION = 300 // 5 minutes in seconds
export const PLAYERS_PER_TEAM = 7
export const WIN_REWARD = 1000
export const MAP_SIZE = 60
export const MOUNTAIN_HEIGHT = 20
export const MOUNTAIN_TOP: [number, number, number] = [0, MOUNTAIN_HEIGHT, 0]
export const FLAG_CAPTURE_RADIUS = 3
export const PLAYER_BASE_SPEED = 0.15
export const STUN_DURATION = 60 // frames
export const TACKLE_RANGE = 3

export const RED_BASE: [number, number, number] = [-25, 0.5, -25]
export const BLUE_BASE: [number, number, number] = [25, 0.5, 25]

export const FLAG_SPAWNS: [number, number, number][] = [
  [-15, 0.5, 10],
  [15, 0.5, -10],
  [0, 5, 5],
  [-10, 2, -5],
  [10, 2, 5],
]

export const SHOP_ITEMS: Equipment[] = [
  {
    id: 'iron-boots',
    name: 'Iron Boots',
    slot: 'boots',
    price: 200,
    speedBonus: 0.03,
    defenseBonus: 0,
    description: '+20% speed',
    icon: '👢',
  },
  {
    id: 'diamond-boots',
    name: 'Diamond Boots',
    slot: 'boots',
    price: 500,
    speedBonus: 0.06,
    defenseBonus: 0,
    description: '+40% speed',
    icon: '💎👢',
  },
  {
    id: 'iron-armor',
    name: 'Iron Armor',
    slot: 'armor',
    price: 300,
    speedBonus: 0,
    defenseBonus: 2,
    description: '+2 defense (harder to stun)',
    icon: '🛡️',
  },
  {
    id: 'diamond-armor',
    name: 'Diamond Armor',
    slot: 'armor',
    price: 700,
    speedBonus: 0,
    defenseBonus: 5,
    description: '+5 defense (very hard to stun)',
    icon: '💎🛡️',
  },
  {
    id: 'iron-sword',
    name: 'Iron Sword',
    slot: 'weapon',
    price: 250,
    speedBonus: 0,
    defenseBonus: 0,
    description: 'Longer tackle range',
    icon: '⚔️',
  },
  {
    id: 'diamond-sword',
    name: 'Diamond Sword',
    slot: 'weapon',
    price: 600,
    speedBonus: 0,
    defenseBonus: 0,
    description: 'Maximum tackle range + stun',
    icon: '💎⚔️',
  },
  {
    id: 'iron-helmet',
    name: 'Iron Helmet',
    slot: 'helmet',
    price: 200,
    speedBonus: 0.01,
    defenseBonus: 1,
    description: '+1 defense, +7% speed',
    icon: '⛑️',
  },
  {
    id: 'diamond-helmet',
    name: 'Diamond Helmet',
    slot: 'helmet',
    price: 450,
    speedBonus: 0.03,
    defenseBonus: 2,
    description: '+2 defense, +20% speed',
    icon: '💎⛑️',
  },
]
