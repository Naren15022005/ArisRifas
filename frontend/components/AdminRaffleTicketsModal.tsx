import React, { useEffect, useMemo, useState } from 'react'

import { getBackendBaseUrl } from '../lib/backend'

export type AdminRaffleTicketsModalProps = {
  raffle: {
    id?: number
    title: string
  }
  onClose: () => void
}

type Ticket = {
  id: number
  number: number
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD'
  purchaserName?: string | null
  purchaserPhone?: string | null
}

export default function AdminRaffleTicketsModal({ raffle, onClose }: AdminRaffleTicketsModalProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBuyersModal, setShowBuyersModal] = useState(false)
  const [buyerSearch, setBuyerSearch] = useState('')

  useEffect(() => {
    if (!raffle?.id) return
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const base = getBackendBaseUrl()
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
        const res = await fetch(`${base}/api/raffles/${raffle.id}/tickets/all`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) throw new Error('No se pudo cargar el talonario')
        const data = await res.json()
        setTickets(data || [])
      } catch (e: any) {
        if (e?.name === 'AbortError') return
        setError('No se pudo cargar el talonario. Vuelve a intentar.')
        setTickets([])
      } finally {
        setLoading(false)
      }
    }

    load()

    return () => controller.abort()
  }, [raffle?.id])

  const { total, available, sold } = useMemo(() => {
    const total = tickets.length
    const available = tickets.filter((t) => t.status === 'AVAILABLE')
    const sold = tickets.filter((t) => t.status === 'SOLD')
    return { total, available, sold }
  }, [tickets])

  const buyers = useMemo(() => {
    const soldTickets = tickets.filter((t) => t.status === 'SOLD' && (t.purchaserName || t.purchaserPhone))
    const map: Record<string, { name: string; phone?: string | null; tickets: number[]; ids: number[] }> = {}
    for (const t of soldTickets) {
      const key = `${t.purchaserName || ''}||${t.purchaserPhone || ''}`
      if (!map[key]) map[key] = { name: t.purchaserName || 'Sin nombre', phone: t.purchaserPhone || '', tickets: [], ids: [] }
      map[key].tickets.push(t.number)
      map[key].ids.push(t.id)
    }
    return Object.values(map).map((b) => ({ ...b, tickets: b.tickets.sort((a, b) => a - b) }))
  }, [tickets])

  async function handleRevertSold(ticket: Ticket) {
    if (!raffle?.id) return
    const label = String(ticket.number).padStart(3, '0')
    const confirm = window.confirm(`¿Marcar el número ${label} como disponible otra vez?`)
    if (!confirm) return

    try {
      const base = getBackendBaseUrl()
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      const res = await fetch(`${base}/api/tickets/${ticket.id}/revert-to-available`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error('No se pudo cambiar el estado')

      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: 'AVAILABLE' } : t)),
      )
    } catch (e) {
      console.error(e)
      window.alert('No se pudo cambiar el estado de la boleta. Intenta de nuevo.')
    }
  }

  function renderPills(list: Ticket[]) {
    if (!list.length) return <div className="text-xs text-gray-500">Ninguno</div>
    return (
      <div className="grid grid-cols-5 gap-1.5 max-h-48 overflow-auto pr-1">
        {list.map((t) => (
          <span
            key={t.id}
            className="flex items-center justify-center h-10 rounded-xl bg-[#111111] text-gray-100 text-[11px] border border-white/5 shadow-sm"
          >
            {String(t.number).padStart(3, '0')}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-3 sm:px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl bg-[#050505] rounded-2xl border border-white/10 shadow-xl p-4 sm:p-6 flex flex-col max-h-[90vh]">
        <header className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white">Gestión talonario</h2>
            <p className="text-xs sm:text-sm text-gray-400">{raffle.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/5"
          >
            Cerrar
          </button>
        </header>

        {loading && <div className="text-sm text-gray-400">Cargando talonario…</div>}
        {error && !loading && <div className="text-sm text-red-400 mb-2">{error}</div>}

        {!loading && !error && (
          <>
            <section className="grid grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
              <div className="bg-gray-900/70 rounded-xl px-3 py-3 border border-gray-800 flex flex-col justify-between min-h-[80px]">
                <div className="text-gray-400">Total números</div>
                <div className="text-lg font-semibold text-white">{total}</div>
              </div>
              <div className="bg-yellow-900/30 rounded-xl px-3 py-3 border border-yellow-700/60 flex flex-col justify-between min-h-[80px]">
                <div className="text-yellow-200 text-[11px] uppercase tracking-wide">Disponibles</div>
                <div className="text-lg font-semibold text-yellow-100">{available.length}</div>
              </div>
              <button
                type="button"
                onClick={() => sold.length > 0 && setShowBuyersModal(true)}
                className="bg-red-900/40 rounded-xl px-3 py-3 border border-red-700/60 flex flex-col justify-between min-h-[80px] col-span-2 text-left hover:border-red-400/70 hover:bg-red-900/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-red-300 text-[11px] uppercase tracking-wide flex items-center gap-2">
                      Comprados
                      {sold.length > 0 && (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowBuyersModal(true)}
                            className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] bg-yellow-500 text-black font-semibold"
                          >
                            Compradores
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-red-200">{sold.length}</div>
                  </div>
                  <span className="text-xs text-red-200/80 hidden sm:inline">Pulsa para ver boletas compradas</span>
                </div>
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-red-950/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 transition-all duration-300"
                      style={{ width: `${total ? Math.min(100, Math.round((sold.length / total) * 100)) : 0}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-red-200/70">
                    {total ? Math.round((sold.length / total) * 100) : 0}% del talonario vendido
                  </div>
                </div>
              </button>
            </section>

            <section className="grid grid-cols-1 gap-4 text-xs">
              <div>
                <h3 className="text-[11px] font-semibold text-yellow-200 mb-1 uppercase tracking-wide">Disponibles</h3>
                {renderPills(available)}
              </div>
            </section>
          </>
        )}

        

        {showBuyersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4">
            <div className="absolute inset-0 bg-black/80" onClick={() => setShowBuyersModal(false)} />
            <div className="relative z-10 w-full max-w-lg sm:max-w-xl bg-[#050505] rounded-2xl border border-yellow-700/70 shadow-2xl p-3 sm:p-5 max-h-[85vh] flex flex-col">
              <button
                type="button"
                onClick={() => setShowBuyersModal(false)}
                aria-label="Cerrar compradores"
                className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                Cerrar
              </button>
              <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Compradores</h3>
                  <p className="text-xs text-gray-400">Listado de compradores y sus boletas</p>
                  <p className="text-[11px] text-yellow-200/80 mt-1">Total compradores: {buyers.length}</p>
                </div>
                <div className="flex w-full sm:w-auto flex-col sm:flex-row items-start sm:items-center gap-2">
                  <input
                    value={buyerSearch}
                    onChange={(e) => setBuyerSearch(e.target.value)}
                    placeholder="Buscar por número(s) de boleta (ej. 12, 15-20)"
                    inputMode="numeric"
                    pattern="[0-9,\-\s]*"
                    className="w-full sm:w-64 text-sm p-2 rounded-lg bg-[#0b0b0b] border border-[#222] text-white"
                  />
                </div>
              </header>

              <div className="flex-1 overflow-auto">
                {buyers.length === 0 ? (
                  <div className="text-sm text-gray-500">Aún no hay compradores registrados.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {buyers
                      .filter((b) => {
                          if (!buyerSearch) return true
                          // build set of target ticket numbers from input like "12, 15-20"
                          const parts = buyerSearch.split(/[,\s]+/).map(p => p.trim()).filter(Boolean)
                          const targets = new Set<number>()
                          for (const p of parts) {
                            if (p.includes('-')) {
                              const [aRaw, bRaw] = p.split('-').map(x => x.trim())
                              const a = parseInt(aRaw, 10)
                              const b = parseInt(bRaw, 10)
                              if (!Number.isNaN(a) && !Number.isNaN(b)) {
                                const start = Math.min(a, b)
                                const end = Math.max(a, b)
                                // cap range size to avoid accidental massive loops
                                const cap = 500
                                const len = Math.min(cap, end - start + 1)
                                for (let v = start, i = 0; v <= end && i < len; v++, i++) targets.add(v)
                              }
                            } else {
                              const val = parseInt(p, 10)
                              if (!Number.isNaN(val)) targets.add(val)
                            }
                          }
                          if (targets.size === 0) return false
                          // Also support exact match against padded display form (e.g. '001')
                          const tokenStrs = new Set(parts.map(p => p.replace(/^0+/, '') ? p : p))
                          return b.tickets.some((n) => {
                            const num = Number(n)
                            if (targets.has(num)) return true
                            const padded = String(n).padStart(3, '0')
                            if (tokenStrs.has(padded)) return true
                            return false
                          })
                        })
                        .map((b, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#0b0b0b] border border-[#222] flex flex-col sm:flex-row justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white">{b.name}</div>
                            {b.phone && <div className="text-xs text-gray-400">{b.phone}</div>}
                            <div className="mt-2 text-[11px] text-gray-300">Boletas:</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {b.tickets.map((n, idx) => {
                                const id = b.ids && b.ids[idx]
                                const ticketObj = id ? tickets.find((tt) => tt.id === id) : undefined
                                return (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => ticketObj && handleRevertSold(ticketObj)}
                                    title={ticketObj ? (ticketObj.purchaserName || ticketObj.purchaserPhone ? `${ticketObj.purchaserName || ''} ${ticketObj.purchaserPhone || ''}`.trim() : 'Click para devolver este número a disponible') : 'Boleta'}
                                    className="inline-flex items-center justify-center px-2 py-1 rounded bg-[#111] text-xs text-gray-200 border border-white/5 hover:bg-[#222] transition-colors"
                                  >
                                    {String(n).padStart(3,'0')}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className="text-sm font-semibold text-yellow-200">{b.tickets.length} boleta(s)</div>
                            <div className="text-xs text-gray-400 mt-1 hidden sm:block">{b.tickets.slice(0,6).map(n => String(n).padStart(3,'0')).join(', ')}{b.tickets.length>6 ? '…' : ''}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
