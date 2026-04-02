import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useCart } from '../contexts/CartContext'

export type Raffle = {
  id: number
  title: string
  short?: string
  image?: string
  price: number | string
  remaining: number
  total: number
}

type NumberButtonProps = {
  n: number
  isSold: boolean
  isSelected: boolean
  onToggle: (n: number) => void
}

const NumberButton: React.FC<NumberButtonProps> = React.memo(function NumberButton({ n, isSold, isSelected, onToggle }) {
  const handleClick = () => onToggle(n)
  const label = n <= 100 ? String(n).padStart(3, '0') : String(n)
  const baseStyle: React.CSSProperties = { height: 52, fontSize: 14, fontWeight: 600 }
  let style: React.CSSProperties
  if (isSold) {
    style = { ...baseStyle, background: '#161616', color: '#444', cursor: 'not-allowed', border: '1px solid #222' }
  } else if (isSelected) {
    style = { ...baseStyle, background: 'linear-gradient(135deg,var(--aris-red),var(--aris-red-dark))', color: '#fff', border: '1px solid var(--aris-red-dark)', boxShadow: '0 0 10px rgba(122,18,18,0.5)', transform: 'scale(1.06)' }
  } else {
    style = { ...baseStyle, background: '#1a1a1a', color: '#bbb', border: '1px solid #2e2e2e' }
  }
  return (
    <button
      key={n}
      onClick={handleClick}
      disabled={isSold}
      className="flex flex-col items-center justify-center rounded-xl transition-all duration-100"
      style={style}
    >
      <span style={{ lineHeight: 1.1 }}>{label}</span>
    </button>
  )
}, (a, b) => a.isSold === b.isSold && a.isSelected === b.isSelected)


export default function PurchaseModal({ raffle, onClose }: { raffle: Raffle | null; onClose: () => void }) {
  const { addItem, openCheckout, showToast } = useCart()
  const [qty, setQty] = useState(1)
  const [sold, setSold] = useState<Set<number>>(new Set())
  // Use a Set for selections to make membership checks O(1) and avoid
  // expensive array.includes calls on large talonarios.
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [step, setStep] = useState<'select' | 'confirm'>('select')
  const modalRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const [floatingVisible, setFloatingVisible] = useState(false)

  useEffect(() => {
    if (!raffle) return
    setQty(1)
    setSelected(new Set())
    setStep('select')
    const controller = new AbortController()

    async function loadSoldNumbers() {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
        const res = await fetch(`${base}/api/raffles/${raffle.id}/tickets/all`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('No se pudo cargar el talonario')
        const data: { number: number; status: 'AVAILABLE' | 'RESERVED' | 'SOLD' }[] = await res.json()
        const busy = data
          .filter((t) => t.status === 'SOLD' || t.status === 'RESERVED')
          .map((t) => t.number)
        setSold(new Set(busy))
      } catch (e: any) {
        if (e?.name === 'AbortError') return
        console.error('No se pudieron cargar los números vendidos/reservados', e)
        setSold(new Set())
      }
    }

    loadSoldNumbers()

    return () => controller.abort()
  }, [raffle])
  // helper functions and data (defined before early return so hooks stay stable)
  // full talonario (when raffle is null stays empty)
  const numbers = useMemo(() => (raffle ? Array.from({ length: raffle.total }).map((_, i) => i + 1) : []), [raffle?.total])

  const toggleNumber = useCallback((n: number) => {
    if (sold.has(n)) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }, [sold])

  function autoSelectNext() {
    // choose lowest available numbers
    const avail = numbers.filter((n) => !sold.has(n))
    const take = avail.slice(0, qty)
    setSelected(new Set(take))
  }

  // When quantity changes, only trim selections if they exceed the new qty.
  // Do NOT auto-select numbers — let the user pick freely.
  useEffect(() => {
    setSelected((s) => {
      if (s.size > qty) {
        const arr = Array.from(s).sort((a, b) => a - b).slice(0, qty)
        return new Set(arr)
      }
      return s
    })
  }, [qty])

  // Observe footer visibility to show a floating action bar when footer is scrolled out of view.
  useEffect(() => {
    if (!footerRef.current) return
    // Only enable floating behaviour for large talonarios (>100 nums)
    if (!raffle || raffle.total <= 100) {
      setFloatingVisible(false)
      return
    }

    const root = modalRef.current || null
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        // If footer is intersecting the viewport (modal), hide floating bar; otherwise show it when there are selections
        if (e && e.isIntersecting) setFloatingVisible(false)
        else setFloatingVisible(selected.size > 0)
      },
      { root, threshold: 0.1 }
    )

    obs.observe(footerRef.current)
    // also update visibility immediately based on current selection
    if (selected.size > 0 && footerRef.current) {
      // trigger a check by getting bounding rects if observer doesn't fire immediately
      const rect = footerRef.current.getBoundingClientRect()
      const rootRect = (root && (root as Element).getBoundingClientRect && (root as Element).getBoundingClientRect()) || null
      const intersects = rootRect ? !(rect.bottom < rootRect.top || rect.top > rootRect.bottom) : (rect.bottom > 0 && rect.top < (window.innerHeight || 0))
      setFloatingVisible(!intersects)
    }

    return () => obs.disconnect()
  }, [raffle, selected.size])

  if (!raffle) return null

  // Show the "continue shopping?" dialog
  function confirm() {
    setStep('confirm')
  }

  // User wants to keep shopping — add to cart and close modal
  function handleYes() {
    if (!raffle) return
    // Optimistically mark selected numbers as taken in this session
    setSold((prev) => new Set([...Array.from(prev), ...Array.from(selected)]))
    addItem({
      raffleId: raffle.id,
      raffleTitle: raffle.title,
      image: raffle.image,
      numbers: [...selected],
      pricePerTicket: Number(raffle.price) || 0,
    })
    showToast('Boletas añadidas al carrito')
    onClose()
  }

  // User wants to finish now — add to cart then open checkout immediately
  function handleNo() {
    if (!raffle) return
    // Optimistically mark selected numbers as taken in this session
    setSold((prev) => new Set([...Array.from(prev), ...Array.from(selected)]))
    addItem({
      raffleId: raffle.id,
      raffleTitle: raffle.title,
      image: raffle.image,
      numbers: [...selected],
      pricePerTicket: Number(raffle.price) || 0,
    })
    openCheckout()
    onClose()
  }

  const OPTS = [10, 15, 20] as const

  // compute modal style to disable internal scroll when confirm overlay is visible
  const modalStyle: React.CSSProperties = {
    maxHeight: '92vh',
    background: '#0d0d0d',
    border: '1px solid rgba(212,175,55,0.2)',
    overflow: step === 'confirm' ? 'hidden' : 'auto'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      <div
        ref={modalRef}
        className="relative w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col md:flex-row"
        style={modalStyle}
      >
        {/* Gold top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />

        {/* ── Close button ── */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 z-10 text-gray-500 hover:text-white transition-colors text-xl leading-none"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className="md:w-[42%] flex flex-col" style={{ borderRight: '1px solid rgba(212,175,55,0.12)' }}>
          {/* Image */}
          <div className="relative overflow-hidden" style={{ background: '#111' }}>
            <img
              src={raffle.image || '/images/placeholder.svg'}
              alt={raffle.title}
              className="w-full object-cover"
              style={{ maxHeight: '38vh', objectPosition: 'center' }}
            />
            {/* Category badge */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ background: 'rgba(212,175,55,0.08)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.18)' }}>
              {(raffle.short || '').split(' · ')[0] || 'Rifa'}
            </div>
            
          </div>

          {/* Info */}
          <div className="p-5 flex flex-col gap-3 flex-1">
            <div>
              <h2 className="text-2xl font-extrabold text-white leading-tight">{raffle.title}</h2>
              <p className="text-sm text-gray-400 mt-1">{raffle.short || 'Descripción breve del producto.'}</p>
            </div>

            {/* Price tag */}
            <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.08)' }}>
              <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Precio por boleto</div>
                  {(() => {
                    const p = Number(raffle.price ?? 0)
                    const fmt = Number.isNaN(p) ? '0' : p.toLocaleString()
                    return <div className="text-2xl font-extrabold" style={{ color: '#d4af37' }}>${fmt}</div>
                  })()}
                </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-gray-500 uppercase tracking-widest">Disponibles</div>
                <div className="text-lg font-bold text-white">{raffle.remaining}</div>
              </div>
            </div>

            {/* Quantity picker */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Cantidad de boletos</div>
              <div className="flex gap-2">
                {OPTS.map((opt) => {
                  const disabled = opt > raffle.remaining
                  const active = qty === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        if (disabled) return
                        if (active) {
                          // toggle off: reset to 1 and clear selections
                          setQty(1)
                          setSelected(new Set())
                        } else {
                          setQty(opt)
                          setSelected(new Set())
                        }
                      }}
                      disabled={disabled}
                      className="flex-1 flex flex-col items-center py-2 rounded-xl text-sm font-bold transition-all duration-150"
                      style={disabled
                        ? { background: '#1a1a1a', color: '#555', cursor: 'not-allowed', border: '1px solid #222' }
                        : active
                          ? { background: 'var(--aris-red)', color: '#fff', border: '1px solid var(--aris-red-dark)', boxShadow: '0 0 14px rgba(122,18,18,0.45)' }
                          : { background: '#1c1c1c', color: '#ccc', border: '1px solid #333' }
                      }
                    >
                      <span className="text-base">{opt}</span>
                      <span className="text-[10px] mt-0.5" style={{ color: active ? 'rgba(255,255,255,0.7)' : '#666' }}>boletos</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Total */}
            <div className="rounded-xl p-3 flex items-center justify-between mt-auto" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Total a pagar</div>
                <div className="text-xl font-extrabold" style={{ color: '#d4af37' }}>${(() => {
                  const unit = Number(raffle.price ?? 0) || 0
                  const total = (selected.size > 0 ? selected.size : qty) * unit
                  return Number.isNaN(total) ? '0' : total.toLocaleString()
                })()}</div>
              </div>
              <div />
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT COLUMN ══════════ */}
        <div className="md:flex-1 flex flex-col" style={{ minWidth: 0 }}>
          {/* Talonario header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
            <div>
              <div className="text-base font-bold text-white">Elige tus números</div>
              <div className="text-xs text-gray-500 mt-0.5">Selecciona los números que quieras. Los seleccionados se agregarán al total.</div>
            </div>
            {/* Progress pill (responsive) */}
            <div
              className="flex items-center gap-1.5 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-xs font-semibold whitespace-nowrap flex-shrink-0"
              style={{
                background: selected.size > 0 ? 'rgba(122,18,18,0.25)' : 'rgba(40,40,40,0.8)',
                border: `1px solid ${selected.size > 0 ? 'rgba(122,18,18,0.45)' : '#333'}`,
                color: selected.size > 0 ? '#fff' : '#aaa'
              }}
            >
              <span className="text-sm">{selected.size > 0 ? '✓' : '○'}</span>
              <span className="ml-1 sm:ml-2 font-bold">{selected.size}</span>
              <span className="ml-1 hidden sm:inline"> seleccionados</span>
            </div>
          </div>

          {/* Legend */}
          <div className="px-5 py-2 flex items-center gap-4 text-xs text-gray-500" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-gray-700" />Vendido</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full" style={{ background: '#1c1c1c', border: '1px solid #444' }} />Disponible</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full" style={{ background: 'var(--aris-red)' }} />Seleccionado</span>
          </div>

          {/* Number grid */}
          <div className="flex-1 overflow-auto hide-scroll px-5 py-4">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: 8 }}>
              {numbers.map((n) => {
                  const isSold = sold.has(n)
                  const isSelected = selected.has(n)
                  return (
                    <NumberButton key={n} n={n} isSold={isSold} isSelected={isSelected} onToggle={toggleNumber} />
                  )
                })}
            </div>
          </div>

          {/* Footer actions */}
          <div ref={footerRef} className="px-5 pb-5 pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                style={{ border: '1px solid #2e2e2e', background: 'transparent' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirm}
                disabled={selected.size === 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150"
                style={selected.size > 0
                  ? { background: 'linear-gradient(135deg,var(--aris-red),var(--aris-red-dark))', border: '1px solid var(--aris-red-dark)', boxShadow: '0 4px 18px rgba(122,18,18,0.45)' }
                  : { background: '#1a1a1a', border: '1px solid #333', color: '#666', cursor: 'not-allowed' }
                }
              >
                {selected.size > 0
                  ? `Confirmar ${selected.size} boleto${selected.size !== 1 ? 's' : ''} — $${(selected.size * Number(raffle.price)).toLocaleString()}`
                  : `Selecciona al menos 1 número`
                }
              </button>
            </div>
          </div>

          {floatingVisible && (
            <div
              className="fixed left-1/2 bottom-6 z-60 -translate-x-1/2 transform"
              style={{
                background: 'linear-gradient(180deg, rgba(13,13,13,0.98), rgba(18,18,18,0.98))',
                border: '1px solid rgba(212,175,55,0.12)',
                padding: '6px 10px',
                borderRadius: 12,
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  className="rounded px-3 py-1 text-sm font-medium"
                  onClick={onClose}
                  style={{ color: '#bdbdbd', border: '1px solid rgba(255,255,255,0.02)', background: 'transparent' }}
                >
                  Cancelar
                </button>
                <button
                  className="rounded px-3 py-1 text-sm font-bold text-white"
                  onClick={() => {
                    if (selected.size === 0) return showToast('Selecciona al menos 1 número')
                    setStep('confirm')
                  }}
                  style={{
                    background: 'linear-gradient(135deg,var(--aris-red),var(--aris-red-dark))',
                    border: '1px solid var(--aris-red-dark)',
                    boxShadow: '0 6px 18px rgba(122,18,18,0.35)'
                  }}
                >
                  Confirmar ({selected.size})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {step === 'confirm' && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center px-4 py-6"
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0 bg-black/85" onClick={() => setStep('select')} />
          <div className="relative max-w-sm w-full rounded-2xl p-6" style={{ background: 'rgba(13,13,13,0.98)', border: '1px solid rgba(255,255,255,0.04)', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="text-center px-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-14 h-14 mx-auto mb-4"
                fill="none"
                stroke="#d4af37"
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              <h3 className="text-xl font-extrabold text-white mb-2">Deseas continuar comprando?</h3>
              <p className="text-sm text-gray-400 mb-6">Puedes agregar estas <span className="font-bold text-white">{selected.size}</span> boleta(s) al carrito y seguir eligiendo, o finalizar la compra ahora.</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleYes} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,var(--aris-red),var(--aris-red-dark))', border: '1px solid var(--aris-red-dark)' }}>Si, seguir comprando</button>
                <button onClick={handleNo} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.25)', color: '#d4af37' }}>No, finalizar ahora</button>
                <button onClick={() => setStep('select')} className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">Volver a elegir numeros</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

