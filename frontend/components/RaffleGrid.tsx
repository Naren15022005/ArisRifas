import React, { useState, useEffect } from 'react'
import useRafflesSocket from '../hooks/useRafflesSocket'

// Local helper: deterministic thousands separator (dot)
function formatNumber(n: number) {
  return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
import PurchaseModal, { Raffle as PurchaseRaffle } from './PurchaseModal'

type Raffle = PurchaseRaffle

function RaffleGrid({ items }: { items: Raffle[] }) {
  const [selected, setSelected] = useState<Raffle | null>(null)
  const [localItems, setLocalItems] = useState<Raffle[]>(items || [])

  useEffect(() => setLocalItems(items || []), [items])

  // Listen for purchase events and update remaining locally,
  // and also for raffle updates (title, image, price, etc.).
  useRafflesSocket(
    (ev) => {
      setLocalItems((prev) =>
        prev.map((r) => {
          if (r.id !== ev.raffleId) return r
          const remaining = Number((r as any).remaining ?? 0) || 0
          return { ...r, remaining: Math.max(0, remaining - ev.quantity) }
        }),
      )
    },
    (updated: any) => {
      setLocalItems((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)),
      )
    },
  )

  return (
    <section id="rifas" className="mx-auto px-0 sm:px-1 lg:px-0 mt-0 sm:mt-0">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {localItems.map((r) => {
          const rawImg = (r as any).image || (r as any).imageUrl
          const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
          const img = rawImg && String(rawImg).startsWith('/uploads') ? base + String(rawImg) : (rawImg || '/images/placeholder.svg')
          const remaining = Number((r as any).remaining ?? (r as any).total ?? (r as any).totalTickets ?? 0) || 0
          return (
          <div key={r.id} className="p-0 sm:p-1">
            <div className="rounded-lg overflow-hidden h-full flex flex-col border-[1px]" style={{ borderColor: 'rgba(214,168,59,0.12)', background: 'linear-gradient(180deg,#0b0f13 0%, #080a0c 100%)' }}>
              <div className="w-full h-24 sm:h-36 md:h-40 lg:h-44 overflow-hidden">
                <img loading="lazy" src={img} alt={r.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 sm:p-3 flex-1 flex flex-col">
                <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white leading-tight mt-1 mb-1">{r.title}</h3>
                <p className="text-xs sm:text-sm text-gray-300 mb-2 line-clamp-2">{r.short || ''}</p>

                <div className="text-xs sm:text-sm text-gray-400 mb-2 flex flex-wrap gap-3 items-center">
                  <span>Precio: <span className="text-white font-semibold">${formatNumber(Number((r as any).price ?? (r as any).pricePerTicket ?? 0))}</span></span>
                  {/* estimatedValue removed from grid card; shown in modal only */}
                  {(r as any).associatedLottery && (
                    <span>Lotería: <span className="text-white font-semibold">{(r as any).associatedLottery}</span></span>
                  )}
                </div>

                <div className="mt-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-sm text-gray-300 mb-2 sm:mb-0">{remaining} disponibles</div>
                  <button
                    onClick={() => {
                      // pass a normalized raffle object to the modal so it has
                      // resolved image URLs and numeric fields (price/remaining/total)
                      setSelected({
                        ...r,
                        image: img,
                        price: Number((r as any).price ?? (r as any).pricePerTicket ?? 0),
                        remaining: remaining,
                        total: Number((r as any).total ?? (r as any).totalTickets ?? 0),
                      })
                    }}
                    className="text-white rounded-full px-4 py-2 text-sm font-medium w-full sm:w-auto transition-opacity hover:opacity-90 flex items-center justify-center"
                    style={{ background: 'var(--aris-red)', border: '1px solid var(--aris-red-dark)' }}
                  >
                    Comprar
                  </button>
                </div>
              </div>
            </div>
          </div>
          )
        })}
      </div>
      <PurchaseModal raffle={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

export default React.memo(RaffleGrid)
