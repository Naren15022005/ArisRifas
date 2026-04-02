import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

export type CartItem = {
  raffleId: number
  raffleTitle: string
  image?: string
  numbers: number[]
  pricePerTicket: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (raffleId: number) => void
  clearCart: () => void
  totalTickets: number
  checkoutOpen: boolean
  openCheckout: () => void
  closeCheckout: () => void
  toast: string | null
  showToast: (msg: string) => void
}

const defaultCtx: CartContextType = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  totalTickets: 0,
  checkoutOpen: false,
  openCheckout: () => {},
  closeCheckout: () => {},
  toast: null,
  showToast: () => {},
}

export const CartContext = createContext<CartContextType>(defaultCtx)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aris_cart')
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem('aris_cart', JSON.stringify(items))
    } catch {}
  }, [items])

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.raffleId === newItem.raffleId)
      if (existing) {
        const merged = Array.from(new Set([...existing.numbers, ...newItem.numbers])).sort(
          (a, b) => a - b
        )
        return prev.map((i) =>
          i.raffleId === newItem.raffleId ? { ...i, numbers: merged } : i
        )
      }
      return [...prev, newItem]
    })
  }, [])

  const removeItem = useCallback((raffleId: number) => {
    setItems((prev) => prev.filter((i) => i.raffleId !== raffleId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const openCheckout = useCallback(() => setCheckoutOpen(true), [])
  const closeCheckout = useCallback(() => setCheckoutOpen(false), [])

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const totalTickets = items.reduce((sum, i) => sum + i.numbers.length, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        totalTickets,
        checkoutOpen,
        openCheckout,
        closeCheckout,
        toast,
        showToast,
      }}
    >
      {children}

      {/* Global toast notification */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-[9999] px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white pointer-events-none"
          style={{
            transform: 'translateX(-50%)',
            background: 'rgba(20,70,30,0.97)',
            border: '1px solid rgba(70,160,70,0.4)',
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
