'use client'

import { useGameStore } from '@/store/gameStore'

export default function MainMenu() {
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)
  const money = useGameStore((s) => s.money)
  const totalWins = useGameStore((s) => s.totalWins)

  if (phase !== 'menu') return null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-400 to-green-600 z-50">
      <div className="text-center">
        {/* Title block - Minecraft style */}
        <div className="mb-8">
          <h1
            className="text-6xl md:text-8xl font-bold tracking-wider"
            style={{
              fontFamily: 'monospace',
              color: '#FFD700',
              textShadow: '4px 4px 0 #8B6914, 8px 8px 0 rgba(0,0,0,0.3)',
              letterSpacing: '0.1em',
            }}
          >
            搶旗仔
          </h1>
          <h2
            className="text-2xl md:text-4xl font-bold mt-2"
            style={{
              fontFamily: 'monospace',
              color: '#fff',
              textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
            }}
          >
            CAPTURE THE FLAG
          </h2>
        </div>

        {/* Stats */}
        {(money > 0 || totalWins > 0) && (
          <div className="mb-6 flex gap-6 justify-center">
            <div className="bg-black/40 px-4 py-2 border-2 border-yellow-500/50" style={{ fontFamily: 'monospace' }}>
              <span className="text-yellow-400">💰 ${money.toLocaleString()}</span>
            </div>
            <div className="bg-black/40 px-4 py-2 border-2 border-green-500/50" style={{ fontFamily: 'monospace' }}>
              <span className="text-green-400">🏆 {totalWins} Wins</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => setPhase('team-select')}
            className="block w-72 mx-auto px-8 py-4 text-xl font-bold text-white border-4 border-gray-600 hover:border-white transition-colors cursor-pointer"
            style={{
              fontFamily: 'monospace',
              backgroundColor: '#4a4a4a',
              textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
              boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.3), inset 0 4px 0 rgba(255,255,255,0.1)',
            }}
          >
            ▶ Play Game
          </button>

          {money > 0 && (
            <button
              onClick={() => setPhase('shop')}
              className="block w-72 mx-auto px-8 py-4 text-xl font-bold text-white border-4 border-gray-600 hover:border-white transition-colors cursor-pointer"
              style={{
                fontFamily: 'monospace',
                backgroundColor: '#4a4a4a',
                textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
                boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.3), inset 0 4px 0 rgba(255,255,255,0.1)',
              }}
            >
              🛒 Equipment Shop
            </button>
          )}
        </div>

        {/* Instructions */}
        <div
          className="mt-8 bg-black/40 p-4 max-w-md mx-auto border-2 border-white/20 text-left"
          style={{ fontFamily: 'monospace' }}
        >
          <p className="text-white/80 text-sm mb-2">📋 How to Play:</p>
          <p className="text-white/60 text-xs">• WASD / Arrow Keys to move</p>
          <p className="text-white/60 text-xs">• E to pick up flags</p>
          <p className="text-white/60 text-xs">• SPACE / F to tackle enemies</p>
          <p className="text-white/60 text-xs">• Carry flags to the mountain top!</p>
          <p className="text-white/60 text-xs">• Win = $1,000 for equipment</p>
        </div>
      </div>
    </div>
  )
}
