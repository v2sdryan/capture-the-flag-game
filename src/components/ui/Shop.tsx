'use client'

import { useGameStore } from '@/store/gameStore'
import { SHOP_ITEMS } from '@/lib/constants'
import { Equipment } from '@/types/game'

export default function Shop() {
  const phase = useGameStore((s) => s.phase)
  const money = useGameStore((s) => s.money)
  const buyEquipment = useGameStore((s) => s.buyEquipment)
  const setPhase = useGameStore((s) => s.setPhase)
  const players = useGameStore((s) => s.players)
  const playerId = useGameStore((s) => s.playerId)

  if (phase !== 'shop') return null

  const player = players.find((p) => p.id === playerId)
  const equippedItems = player?.equipment ?? {}

  function handleBuy(item: Equipment) {
    buyEquipment(item)
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 z-50">
      <div className="max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-3xl font-bold text-white"
            style={{
              fontFamily: 'monospace',
              textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
            }}
          >
            🛒 Equipment Shop
          </h2>
          <div className="flex items-center gap-4">
            <span
              className="text-xl text-yellow-400"
              style={{ fontFamily: 'monospace' }}
            >
              💰 ${money.toLocaleString()}
            </span>
            <button
              onClick={() => setPhase('menu')}
              className="px-4 py-2 bg-gray-700 border-2 border-gray-500 hover:border-white text-white cursor-pointer"
              style={{ fontFamily: 'monospace' }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Equipped items */}
        {player && Object.keys(equippedItems).length > 0 && (
          <div className="mb-6 bg-black/40 border-2 border-yellow-600/40 p-4">
            <h3
              className="text-lg text-yellow-400 mb-2"
              style={{ fontFamily: 'monospace' }}
            >
              Equipped:
            </h3>
            <div className="flex gap-4 flex-wrap">
              {Object.values(equippedItems).map(
                (eq) =>
                  eq && (
                    <div
                      key={eq.id}
                      className="bg-yellow-900/30 border border-yellow-600/40 px-3 py-1 text-sm text-yellow-300"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {eq.icon} {eq.name}
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {/* Shop grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SHOP_ITEMS.map((item) => {
            const isEquipped = equippedItems[item.slot]?.id === item.id
            const canAfford = money >= item.price
            const hasSlotItem = !!equippedItems[item.slot]

            return (
              <div
                key={item.id}
                className={`border-2 p-4 ${
                  isEquipped
                    ? 'border-yellow-500 bg-yellow-900/20'
                    : 'border-gray-600 bg-gray-800/80'
                }`}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3
                  className="text-white font-bold"
                  style={{ fontFamily: 'monospace' }}
                >
                  {item.name}
                </h3>
                <p
                  className="text-gray-400 text-xs mt-1"
                  style={{ fontFamily: 'monospace' }}
                >
                  {item.description}
                </p>
                <p
                  className="text-xs text-gray-500 mt-1"
                  style={{ fontFamily: 'monospace' }}
                >
                  Slot: {item.slot}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`text-sm ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}
                    style={{ fontFamily: 'monospace' }}
                  >
                    ${item.price}
                  </span>
                  {isEquipped ? (
                    <span
                      className="text-xs text-yellow-400"
                      style={{ fontFamily: 'monospace' }}
                    >
                      EQUIPPED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`px-3 py-1 text-xs border cursor-pointer ${
                        canAfford
                          ? 'border-green-600 bg-green-900/50 text-green-400 hover:border-green-400'
                          : 'border-gray-700 bg-gray-900 text-gray-600 cursor-not-allowed'
                      }`}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {hasSlotItem ? 'UPGRADE' : 'BUY'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
