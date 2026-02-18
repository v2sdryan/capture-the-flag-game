'use client'

import dynamic from 'next/dynamic'
import MainMenu from './ui/MainMenu'
import TeamSelect from './ui/TeamSelect'
import GameHUD from './ui/GameHUD'
import Shop from './ui/Shop'
import GameOver from './ui/GameOver'
import MobileControls from './ui/MobileControls'

const GameScene = dynamic(() => import('./game/GameScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
      <div
        className="text-white text-2xl animate-pulse"
        style={{ fontFamily: 'monospace' }}
      >
        Loading Game...
      </div>
    </div>
  ),
})

export default function Game() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-black text-white">
      <GameScene />
      <GameHUD />
      <MobileControls />
      <MainMenu />
      <TeamSelect />
      <Shop />
      <GameOver />
    </div>
  )
}
