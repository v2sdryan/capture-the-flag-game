'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'

export default function MobileControls() {
  const phase = useGameStore((s) => s.phase)
  const movePlayer = useGameStore((s) => s.movePlayer)
  const tryPickupFlag = useGameStore((s) => s.tryPickupFlag)
  const tryTackle = useGameStore((s) => s.tryTackle)
  
  const [isMobile, setIsMobile] = useState(false)
  const joystickRef = useRef<HTMLDivElement>(null)
  const [touchData, setTouchData] = useState<{ x: number, y: number } | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (phase !== 'playing' || !touchData) return

    const moveLoop = setInterval(() => {
      const dir: [number, number, number] = [touchData.x, 0, touchData.y]
      movePlayer(dir)
    }, 16)

    return () => clearInterval(moveLoop)
  }, [phase, touchData, movePlayer])

  if (phase !== 'playing' || !isMobile) return null

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickRef.current) return
    const touch = e.touches[0]
    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    let dx = touch.clientX - centerX
    let dy = touch.clientY - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxRadius = rect.width / 2

    if (distance > maxRadius) {
      dx *= maxRadius / distance
      dy *= maxRadius / distance
    }

    setTouchData({ x: dx / maxRadius, y: dy / maxRadius })
  }

  const handleTouchEnd = () => {
    setTouchData(null)
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-end p-8 select-none">
      <div className="flex justify-between items-end w-full">
        {/* Joystick Area */}
        <div 
          ref={joystickRef}
          className="w-32 h-32 bg-white/10 border-4 border-white/20 rounded-full flex items-center justify-center pointer-events-auto active:bg-white/20 touch-none"
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="w-12 h-12 bg-white/40 rounded-full shadow-lg"
            style={{
              transform: touchData ? `translate(${touchData.x * 40}px, ${touchData.y * 40}px)` : 'none'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button 
            className="w-20 h-20 bg-yellow-500/60 border-4 border-yellow-400 rounded-full flex items-center justify-center text-white font-bold pointer-events-auto active:scale-90 touch-none"
            onPointerDown={(e) => { e.preventDefault(); tryPickupFlag(); }}
            style={{ fontFamily: 'monospace', textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
          >
            PICK
          </button>
          <button 
            className="w-24 h-24 bg-red-600/60 border-4 border-red-500 rounded-full flex items-center justify-center text-white font-bold pointer-events-auto active:scale-90 touch-none"
            onPointerDown={(e) => { e.preventDefault(); tryTackle(); }}
            style={{ fontFamily: 'monospace', textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
          >
            TACKLE
          </button>
        </div>
      </div>
    </div>
  )
}
