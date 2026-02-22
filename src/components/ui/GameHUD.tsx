'use client'

import { useState, useEffect, useRef, memo } from 'react'
import { useGameStore } from '@/store/gameStore'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Timer only re-renders when the displayed second changes
const Timer = memo(function Timer() {
  const [displayTime, setDisplayTime] = useState('')
  const [isLow, setIsLow] = useState(false)

  useEffect(() => {
    let lastSecond = -1
    const unsub = useGameStore.subscribe((state) => {
      const sec = Math.floor(state.timeRemaining)
      if (sec !== lastSecond) {
        lastSecond = sec
        setDisplayTime(formatTime(state.timeRemaining))
        setIsLow(state.timeRemaining < 60)
      }
    })
    return unsub
  }, [])

  return (
    <div
      className={`px-6 py-3 border-2 ${
        isLow ? 'border-red-500 bg-red-900/80' : 'border-white/30 bg-black/60'
      }`}
    >
      <div
        className={`text-4xl font-bold ${
          isLow ? 'text-red-400 animate-pulse' : 'text-white'
        }`}
      >
        {displayTime}
      </div>
    </div>
  )
})

// Player status only re-renders when hasFlag or stunned changes
const PlayerStatus = memo(function PlayerStatus() {
  const [status, setStatus] = useState<{
    name: string
    team: string
    hasFlag: boolean
    stunned: boolean
  } | null>(null)

  useEffect(() => {
    let lastHash = ''
    const unsub = useGameStore.subscribe((state) => {
      if (state.playerId === null) return
      const player = state.players[state.playerId]
      if (!player) return
      const hash = `${player.hasFlag}-${player.stunned}`
      if (hash !== lastHash) {
        lastHash = hash
        setStatus({
          name: player.name,
          team: player.team,
          hasFlag: player.hasFlag,
          stunned: player.stunned,
        })
      }
    })
    return unsub
  }, [])

  if (!status) return null

  return (
    <div className="absolute bottom-4 left-4 bg-black/60 border-2 border-white/20 p-3">
      <div className="text-white text-sm">
        {status.name} ({status.team.toUpperCase()})
      </div>
      <div className="text-xs mt-1">
        {status.hasFlag ? (
          <span className="text-yellow-400">🚩 Carrying Flag - Go to Mountain Top!</span>
        ) : (
          <span className="text-gray-400">No flag - Press E near a flag</span>
        )}
      </div>
      {status.stunned && (
        <div className="text-red-400 text-xs mt-1 animate-pulse">
          ★ STUNNED ★
        </div>
      )}
    </div>
  )
})

// Canvas minimap renders at 10fps instead of 60fps
const Minimap = memo(function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playerId = useGameStore((s) => s.playerId)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let lastDraw = 0

    const draw = (time: number) => {
      animId = requestAnimationFrame(draw)
      if (time - lastDraw < 100) return
      lastDraw = time

      const { players, flags } = useGameStore.getState()
      const w = canvas.width
      const h = canvas.height
      const scale = w / 70

      ctx.clearRect(0, 0, w, h)

      // Mountain
      ctx.fillStyle = 'rgba(85, 85, 85, 0.5)'
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, 15 * scale, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'rgba(255, 215, 0, 0.8)'
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, 3 * scale, 0, Math.PI * 2)
      ctx.fill()

      // Flags
      ctx.fillStyle = '#FFD700'
      for (const f of flags) {
        if (f.carriedBy !== null) continue
        ctx.beginPath()
        ctx.arc(
          (f.position[0] + 35) * scale,
          (f.position[2] + 35) * scale,
          1.5 * scale,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }

      // Players
      for (const p of players) {
        const px = (p.position[0] + 35) * scale
        const py = (p.position[2] + 35) * scale
        const r = (p.id === playerId ? 2 : 1) * scale
        ctx.fillStyle = p.team === 'red' ? '#ff4444' : '#4444ff'
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fill()

        if (p.id === playerId) {
          ctx.strokeStyle = '#FFD700'
          ctx.lineWidth = 0.5 * scale
          ctx.stroke()
        }
      }
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [playerId])

  return (
    <div className="absolute top-24 right-4 w-32 h-32 bg-black/60 border-2 border-white/30">
      <canvas ref={canvasRef} width={128} height={128} className="w-full h-full" />
    </div>
  )
})

export default function GameHUD() {
  const phase = useGameStore((s) => s.phase)
  // Primitive selectors - only re-render when values actually change
  const scoreRed = useGameStore((s) => s.scores.red)
  const scoreBlue = useGameStore((s) => s.scores.blue)
  const carriedRed = useGameStore((s) => s.flags.filter((f) => f.team === 'red').length)
  const carriedBlue = useGameStore((s) => s.flags.filter((f) => f.team === 'blue').length)

  if (phase !== 'playing') return null

  return (
    <div className="absolute inset-0 pointer-events-none z-40" style={{ fontFamily: 'monospace' }}>
      {/* Top bar */}
      <div className="flex justify-between items-start p-4">
        {/* Red score */}
        <div className="bg-red-900/80 border-2 border-red-600 px-4 py-2">
          <div className="text-red-400 text-sm">RED TEAM</div>
          <div className="text-white text-3xl font-bold">{scoreRed}</div>
          <div className="text-red-300/60 text-xs">{carriedRed} flags held</div>
        </div>

        <Timer />

        {/* Blue score */}
        <div className="bg-blue-900/80 border-2 border-blue-600 px-4 py-2">
          <div className="text-blue-400 text-sm">BLUE TEAM</div>
          <div className="text-white text-3xl font-bold">{scoreBlue}</div>
          <div className="text-blue-300/60 text-xs">{carriedBlue} flags held</div>
        </div>
      </div>

      <PlayerStatus />

      {/* Controls reminder - bottom right */}
      <div className="absolute bottom-4 right-4 bg-black/40 border border-white/10 p-2 text-xs text-white/40">
        <div>WASD - Move</div>
        <div>E - Pick Flag</div>
        <div>SPACE - Tackle</div>
      </div>

      <Minimap />
    </div>
  )
}
