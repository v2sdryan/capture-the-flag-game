'use client'

import { useGameStore } from '@/store/gameStore'

export default function TeamSelect() {
  const phase = useGameStore((s) => s.phase)
  const selectTeam = useGameStore((s) => s.selectTeam)

  if (phase !== 'team-select') return null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-700 z-50">
      <div className="text-center">
        <h2
          className="text-4xl font-bold mb-8 text-white"
          style={{
            fontFamily: 'monospace',
            textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
          }}
        >
          Choose Your Team
        </h2>

        <div className="flex gap-8 justify-center">
          {/* Red Team */}
          <button
            onClick={() => selectTeam('red')}
            className="group cursor-pointer"
          >
            <div
              className="w-48 h-64 border-4 border-red-800 group-hover:border-red-400 transition-colors p-6 flex flex-col items-center justify-center gap-4"
              style={{
                backgroundColor: '#661111',
                boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.3), 0 0 20px rgba(255,0,0,0.2)',
              }}
            >
              {/* Player icon */}
              <div className="w-16 h-20 bg-red-600 relative">
                <div className="w-12 h-12 bg-[#f5c6a0] absolute -top-8 left-2" />
              </div>
              <span
                className="text-2xl font-bold text-red-300"
                style={{ fontFamily: 'monospace' }}
              >
                RED TEAM
              </span>
              <span
                className="text-sm text-red-400/70"
                style={{ fontFamily: 'monospace' }}
              >
                7 Players
              </span>
            </div>
          </button>

          {/* VS */}
          <div className="flex items-center">
            <span
              className="text-3xl font-bold text-yellow-400"
              style={{
                fontFamily: 'monospace',
                textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
              }}
            >
              VS
            </span>
          </div>

          {/* Blue Team */}
          <button
            onClick={() => selectTeam('blue')}
            className="group cursor-pointer"
          >
            <div
              className="w-48 h-64 border-4 border-blue-800 group-hover:border-blue-400 transition-colors p-6 flex flex-col items-center justify-center gap-4"
              style={{
                backgroundColor: '#111166',
                boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.3), 0 0 20px rgba(0,0,255,0.2)',
              }}
            >
              {/* Player icon */}
              <div className="w-16 h-20 bg-blue-600 relative">
                <div className="w-12 h-12 bg-[#f5c6a0] absolute -top-8 left-2" />
              </div>
              <span
                className="text-2xl font-bold text-blue-300"
                style={{ fontFamily: 'monospace' }}
              >
                BLUE TEAM
              </span>
              <span
                className="text-sm text-blue-400/70"
                style={{ fontFamily: 'monospace' }}
              >
                7 Players
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
