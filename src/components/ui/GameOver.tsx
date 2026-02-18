'use client'

import { useGameStore } from '@/store/gameStore'
import { WIN_REWARD } from '@/lib/constants'

export default function GameOver() {
  const phase = useGameStore((s) => s.phase)
  const winner = useGameStore((s) => s.winner)
  const playerTeam = useGameStore((s) => s.playerTeam)
  const scores = useGameStore((s) => s.scores)
  const money = useGameStore((s) => s.money)
  const playAgain = useGameStore((s) => s.playAgain)
  const setPhase = useGameStore((s) => s.setPhase)

  if (phase !== 'game-over') return null

  const isWinner = winner === playerTeam
  const isDraw = winner === null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="text-center max-w-lg">
        {/* Result */}
        <div className="mb-6">
          {isDraw ? (
            <h2
              className="text-5xl font-bold text-yellow-400"
              style={{
                fontFamily: 'monospace',
                textShadow: '3px 3px 0 rgba(0,0,0,0.5)',
              }}
            >
              DRAW!
            </h2>
          ) : isWinner ? (
            <>
              <h2
                className="text-5xl font-bold text-yellow-400"
                style={{
                  fontFamily: 'monospace',
                  textShadow: '3px 3px 0 rgba(0,0,0,0.5)',
                }}
              >
                🏆 VICTORY! 🏆
              </h2>
              <p
                className="text-2xl text-green-400 mt-4"
                style={{ fontFamily: 'monospace' }}
              >
                +${WIN_REWARD.toLocaleString()} earned!
              </p>
            </>
          ) : (
            <h2
              className="text-5xl font-bold text-red-400"
              style={{
                fontFamily: 'monospace',
                textShadow: '3px 3px 0 rgba(0,0,0,0.5)',
              }}
            >
              DEFEAT
            </h2>
          )}
        </div>

        {/* Scores */}
        <div className="flex justify-center gap-8 mb-8">
          <div
            className={`px-6 py-4 border-2 ${
              winner === 'red' ? 'border-yellow-500' : 'border-red-800'
            } bg-red-900/60`}
          >
            <div
              className="text-red-400 text-sm"
              style={{ fontFamily: 'monospace' }}
            >
              RED
            </div>
            <div
              className="text-white text-4xl font-bold"
              style={{ fontFamily: 'monospace' }}
            >
              {scores.red}
            </div>
          </div>
          <div
            className={`px-6 py-4 border-2 ${
              winner === 'blue' ? 'border-yellow-500' : 'border-blue-800'
            } bg-blue-900/60`}
          >
            <div
              className="text-blue-400 text-sm"
              style={{ fontFamily: 'monospace' }}
            >
              BLUE
            </div>
            <div
              className="text-white text-4xl font-bold"
              style={{ fontFamily: 'monospace' }}
            >
              {scores.blue}
            </div>
          </div>
        </div>

        {/* Money */}
        <div
          className="mb-8 text-yellow-400 text-lg"
          style={{ fontFamily: 'monospace' }}
        >
          💰 Total Money: ${money.toLocaleString()}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={playAgain}
            className="px-8 py-3 text-lg font-bold text-white border-4 border-gray-600 hover:border-white transition-colors cursor-pointer"
            style={{
              fontFamily: 'monospace',
              backgroundColor: '#4a4a4a',
              boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.3)',
            }}
          >
            ▶ Play Again
          </button>
          {money > 0 && (
            <button
              onClick={() => setPhase('shop')}
              className="px-8 py-3 text-lg font-bold text-white border-4 border-gray-600 hover:border-yellow-400 transition-colors cursor-pointer"
              style={{
                fontFamily: 'monospace',
                backgroundColor: '#4a4a4a',
                boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.3)',
              }}
            >
              🛒 Shop
            </button>
          )}
          <button
            onClick={() => setPhase('menu')}
            className="px-8 py-3 text-lg font-bold text-white border-4 border-gray-600 hover:border-white transition-colors cursor-pointer"
            style={{
              fontFamily: 'monospace',
              backgroundColor: '#4a4a4a',
              boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.3)',
            }}
          >
            🏠 Menu
          </button>
        </div>
      </div>
    </div>
  )
}
