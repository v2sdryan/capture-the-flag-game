'use client'

import { useGameStore } from '@/store/gameStore'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function GameHUD() {
  const phase = useGameStore((s) => s.phase)
  const scores = useGameStore((s) => s.scores)
  const timeRemaining = useGameStore((s) => s.timeRemaining)
  const playerId = useGameStore((s) => s.playerId)
  const players = useGameStore((s) => s.players)
  const flags = useGameStore((s) => s.flags)

  if (phase !== 'playing') return null

  const player = players.find((p) => p.id === playerId)
  const isLowTime = timeRemaining < 60
  const carriedFlags = {
    red: flags.filter((f) => f.team === 'red').length,
    blue: flags.filter((f) => f.team === 'blue').length,
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-40" style={{ fontFamily: 'monospace' }}>
      {/* Top bar */}
      <div className="flex justify-between items-start p-4">
        {/* Red score */}
        <div className="bg-red-900/80 border-2 border-red-600 px-4 py-2">
          <div className="text-red-400 text-sm">RED TEAM</div>
          <div className="text-white text-3xl font-bold">{scores.red}</div>
          <div className="text-red-300/60 text-xs">{carriedFlags.red} flags held</div>
        </div>

        {/* Timer */}
        <div
          className={`px-6 py-3 border-2 ${
            isLowTime ? 'border-red-500 bg-red-900/80' : 'border-white/30 bg-black/60'
          }`}
        >
          <div
            className={`text-4xl font-bold ${
              isLowTime ? 'text-red-400 animate-pulse' : 'text-white'
            }`}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Blue score */}
        <div className="bg-blue-900/80 border-2 border-blue-600 px-4 py-2">
          <div className="text-blue-400 text-sm">BLUE TEAM</div>
          <div className="text-white text-3xl font-bold">{scores.blue}</div>
          <div className="text-blue-300/60 text-xs">{carriedFlags.blue} flags held</div>
        </div>
      </div>

      {/* Player status - bottom left */}
      {player && (
        <div className="absolute bottom-4 left-4 bg-black/60 border-2 border-white/20 p-3">
          <div className="text-white text-sm">
            {player.name} ({player.team.toUpperCase()})
          </div>
          <div className="text-xs mt-1">
            {player.hasFlag ? (
              <span className="text-yellow-400">🚩 Carrying Flag - Go to Mountain Top!</span>
            ) : (
              <span className="text-gray-400">No flag - Press E near a flag</span>
            )}
          </div>
          {player.stunned && (
            <div className="text-red-400 text-xs mt-1 animate-pulse">
              ★ STUNNED ★
            </div>
          )}
        </div>
      )}

      {/* Controls reminder - bottom right */}
      <div className="absolute bottom-4 right-4 bg-black/40 border border-white/10 p-2 text-xs text-white/40">
        <div>WASD - Move</div>
        <div>E - Pick Flag</div>
        <div>SPACE - Tackle</div>
      </div>

      {/* Minimap - top right area shifted down */}
      <div className="absolute top-24 right-4 w-32 h-32 bg-black/60 border-2 border-white/30">
        <svg viewBox="-35 -35 70 70" className="w-full h-full">
          {/* Mountain */}
          <circle cx="0" cy="0" r="15" fill="#555" opacity={0.5} />
          <circle cx="0" cy="0" r="3" fill="#FFD700" opacity={0.8} />

          {/* Flags */}
          {flags
            .filter((f) => f.carriedBy === null)
            .map((f) => (
              <circle
                key={f.id}
                cx={f.position[0]}
                cy={f.position[2]}
                r="1.5"
                fill="#FFD700"
              />
            ))}

          {/* Players */}
          {players.map((p) => (
            <circle
              key={p.id}
              cx={p.position[0]}
              cy={p.position[2]}
              r={p.id === playerId ? 2 : 1}
              fill={p.team === 'red' ? '#ff4444' : '#4444ff'}
              stroke={p.id === playerId ? '#FFD700' : 'none'}
              strokeWidth={p.id === playerId ? 0.5 : 0}
            />
          ))}
        </svg>
      </div>
    </div>
  )
}
