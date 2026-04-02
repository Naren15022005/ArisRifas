import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useCart } from '../contexts/CartContext'

function formatN(n: number) {
  return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function Nav() {
  const { items, totalTickets, openCheckout, removeItem } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [cartVisible, setCartVisible] = useState(false)
  const cartCloseTimer = useRef<number | null>(null)
  const navRef = useRef<HTMLDivElement | null>(null)

  // prevent background scroll when mobile menu is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    const prev = document.body.style.overflow
    document.body.style.overflow = cartOpen ? 'hidden' : prev
    return () => { document.body.style.overflow = prev }
  }, [cartOpen])

  useEffect(() => {
    if (cartOpen) {
      if (cartCloseTimer.current) window.clearTimeout(cartCloseTimer.current)
      setCartVisible(true)
      return
    }

    // when closing, wait for animation to finish before unmounting
    if (cartVisible) {
      cartCloseTimer.current = window.setTimeout(() => setCartVisible(false), 300)
    }

    return () => {
      if (cartCloseTimer.current) window.clearTimeout(cartCloseTimer.current)
    }
  }, [cartOpen, cartVisible])

  // notify other UI (FAB) when cart open state changes so they can react
  useEffect(() => {
    if (typeof window === 'undefined') return
    const ev = new CustomEvent('cart:toggle', { detail: { open: cartOpen } })
    window.dispatchEvent(ev)
  }, [cartOpen])

  // Sidebar does not need sheetTop measurement anymore

  const displayCount = totalTickets > 99 ? '99+' : String(totalTickets)

  return (
    <nav className="w-full border-b border-gray-600/50">
      <div ref={navRef} className="w-full relative flex items-center justify-between py-2 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Ir a inicio" className="text-base sm:text-lg font-semibold text-aris-gold">ArisRifas</Link>
        </div>

        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <a href="/rifas" className="text-gray-300 hover:text-white text-sm">Rifas activas</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              aria-label={totalTickets > 0 ? `Ver carrito (${totalTickets})` : 'Carrito vacio'}
              onClick={() => setCartOpen(true)}
              className="relative text-gray-300 hover:text-white p-1 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
                <path d="M13.5.5H11l-.87 8.65a1 1 0 0 1-1 .85h-6.3a1 1 0 0 1-1-.68l-1.33-4a1 1 0 0 1 .14-.9A1 1 0 0 1 1.5 4h9.15" />
                <circle cx="3" cy="13" r=".5" />
                <circle cx="9.5" cy="13" r=".5" />
              </svg>
              {totalTickets > 0 && (
                <span className="absolute -top-1 -right-2 bg-aris-red text-white text-[10px] sm:text-xs rounded-full w-5 h-5 sm:w-5 sm:h-5 flex items-center justify-center">{displayCount}</span>
              )}
            </button>

            <a
              href="/tickets"
              className="hidden sm:inline-block bg-aris-red hover:bg-aris-redDark text-white text-sm px-3 py-2 rounded-md shadow-sm"
            >
              Comprar
            </a>
          </div>

          {typeof document !== 'undefined' && cartVisible && createPortal(
            <>
              <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setCartOpen(false)}
              />

              <aside className={`fixed inset-y-0 right-0 z-50 w-[92vw] max-w-md bg-black/95 border-l border-gray-800 p-6 transform transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`} role="dialog" aria-modal="true">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Carrito</h3>
                  <button aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} className="text-gray-300 p-2 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div className="overflow-auto text-sm text-gray-200 flex-1" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                  {items.length === 0 ? (
                    <div className="text-gray-400 text-center py-10">Tu carrito esta vacio.</div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.raffleId}
                          className="rounded-xl p-3"
                          style={{
                            background: 'rgba(212,175,55,0.04)',
                            border: '1px solid rgba(212,175,55,0.12)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-sm font-bold text-white leading-tight">{item.raffleTitle}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm font-bold" style={{ color: '#d4af37' }}>
                                ${formatN(item.numbers.length * item.pricePerTicket)}
                              </span>
                              <button
                                onClick={() => removeItem(item.raffleId)}
                                className="text-gray-600 hover:text-red-400 transition-colors text-xs leading-none"
                                aria-label="Eliminar del carrito"
                              >
                                &#x2715;
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-1">
                            {item.numbers.map((n) => (
                              <span
                                key={n}
                                className="text-xs px-1.5 py-0.5 rounded font-semibold text-white"
                                style={{ background: 'var(--aris-red)' }}
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.numbers.length} boleta(s) &middot; ${formatN(item.pricePerTicket)} c/u
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Total</span>
                      <span className="text-base font-extrabold" style={{ color: '#d4af37' }}>
                        ${formatN(items.reduce((s, i) => s + i.numbers.length * i.pricePerTicket, 0))}
                      </span>
                    </div>
                    <button
                      onClick={() => { setCartOpen(false); openCheckout() }}
                      className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'var(--aris-red)', border: '1px solid var(--aris-red-dark)' }}
                    >
                      Finalizar compra
                    </button>
                  </div>
                )}
              </aside>
            </>,
            document.body
          )}
        </div>
      </div>
    </nav>
  )
}

