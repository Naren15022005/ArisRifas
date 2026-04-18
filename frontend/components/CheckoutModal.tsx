import React, { useState } from 'react'
import type { CartItem } from '../contexts/CartContext'

import { getBackendBaseUrl } from '../lib/backend'

const ADMIN_WA = '573117561209' // Colombia +57 311 7561209

function formatN(n: number) {
  return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function formatTicketNumber(n: number) {
  return n <= 100 ? String(n).padStart(3, '0') : String(n)
}

function buildTicketHTML(name: string, phone: string, items: CartItem[], date: string): string {
  const total = items.reduce((s, i) => s + i.numbers.length * i.pricePerTicket, 0)
  const rows = items
    .map(
      (item) => `
      <div class="section">
        <h2>${item.raffleTitle}</h2>
        <div class="row"><span class="label">Precio por boleta</span><span class="value">$${formatN(item.pricePerTicket)}</span></div>
        <div class="row"><span class="label">Cantidad</span><span class="value">${item.numbers.length} boleta(s)</span></div>
        <div class="numbers">${item.numbers.map((n) => `<span class="num">${formatTicketNumber(n)}</span>`).join('')}</div>
        <div class="row" style="font-weight:bold"><span class="label">Subtotal</span><span class="value">$${formatN(item.numbers.length * item.pricePerTicket)}</span></div>
      </div>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>Boleta ArisRifas</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:Arial,sans-serif;background:#fff;color:#111;padding:40px;max-width:600px;margin:0 auto;}
  .header{text-align:center;border-bottom:3px solid #7a1212;padding-bottom:18px;margin-bottom:22px;}
  .header h1{color:#7a1212;font-size:26px;font-weight:bold;letter-spacing:1px;}
  .header p{color:#666;font-size:12px;margin-top:4px;}
  .section{margin-bottom:18px;}
  h2{font-size:11px;text-transform:uppercase;color:#7a1212;letter-spacing:1px;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #eee;}
  .row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f5f5f5;font-size:13px;}
  .label{color:#666;}.value{font-weight:600;}
  .numbers{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0 5px;}
  .num{background:#7a1212;color:#fff;border-radius:5px;padding:3px 8px;font-size:12px;font-weight:bold;}
  .total-box{background:#fafafa;border:2px solid #7a1212;border-radius:8px;padding:16px;margin-top:22px;text-align:right;}
  .total-amount{font-size:24px;font-weight:bold;color:#7a1212;margin-top:2px;}
  .footer{margin-top:28px;text-align:center;font-size:11px;color:#999;line-height:1.6;}
  @media print{body{padding:20px;}}
</style>
</head>
<body>
  <div class="header">
    <h1>ArisRifas</h1>
    <p>Boleta de Compra</p>
    <p>Fecha: ${date}</p>
  </div>
  <div class="section">
    <h2>Datos del Cliente</h2>
    <div class="row"><span class="label">Nombre</span><span class="value">${name}</span></div>
    <div class="row"><span class="label">Telefono</span><span class="value">${phone}</span></div>
  </div>
  ${rows}
  <div class="total-box">
    <div style="font-size:12px;color:#666;">Total General</div>
    <div class="total-amount">$${formatN(total)}</div>
  </div>
  <div class="footer">
    <p>Gracias por participar en ArisRifas</p>
    <p>Conserva este comprobante como boleta de tu compra</p>
  </div>
</body>
</html>`
}

function buildWhatsAppText(name: string, phone: string, items: CartItem[], date: string): string {
  const total = items.reduce((s, i) => s + i.numbers.length * i.pricePerTicket, 0)
  const lines = [
    '*BOLETA DE COMPRA - ArisRifas*',
    `Fecha: ${date}`,
    `Cliente: ${name}`,
    `Telefono: ${phone}`,
    '',
    ...items.flatMap((item) => [
      `*${item.raffleTitle}*`,
      `Boletas: ${item.numbers.map((n) => formatTicketNumber(n)).join(', ')}`,
      `Cantidad: ${item.numbers.length} boleta(s)`,
      `Subtotal: $${formatN(item.numbers.length * item.pricePerTicket)}`,
      '',
    ]),
    `*TOTAL: $${formatN(total)}*`,
  ]
  return lines.join('\n')
}

type Props = {
  items: CartItem[]
  onClose: () => void
  onFinish: () => void
}

export default function CheckoutModal({ items, onClose, onFinish }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [done, setDone] = useState(false)

  const total = items.reduce((s, i) => s + i.numbers.length * i.pricePerTicket, 0)
  const valid = name.trim().length > 0 && phone.trim().length > 0

  async function handleFinish() {
    if (!valid) return

    const date = new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    // Persist purchased numbers in backend so they queden marcados como vendidos
    try {
      const base = getBackendBaseUrl()
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      await fetch(base + '/api/tickets/bulk-sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          buyer: { name: name.trim(), phone: phone.trim() },
          items: items.map((i) => ({ raffleId: i.raffleId, numbers: i.numbers })),
        }),
      })
    } catch (e) {
      // en caso de fallo, seguimos con el flujo para no bloquear al usuario
      console.error('No se pudieron marcar como vendidos los números en BD', e)
    }

    // Build invoice message and open WhatsApp to the admin number so the admin receives the purchase details
    try {
      const msg = buildWhatsAppText(name.trim(), phone.trim(), items, date)
      setTimeout(() => {
        try { window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`, '_blank') } catch (e) {}
      }, 400)
    } catch (e) {
      // ignore
    }

    setDone(true)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={done ? onFinish : onClose}
      />
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-y-auto"
        style={{
          background: '#0d0d0d',
          border: '1px solid rgba(212,175,55,0.2)',
          maxHeight: '90vh',
        }}
      >
        {/* Gold top line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg,transparent,#d4af37,transparent)' }}
        />

        <button
          onClick={done ? onFinish : onClose}
          className="absolute top-3 right-4 z-10 text-gray-500 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          &#x2715;
        </button>

        <div className="p-6">
          {!done ? (
            <>
              <h2 className="text-xl font-extrabold text-white mb-1">Finalizar compra</h2>
              <p className="text-sm text-gray-500 mb-5">
                Completa tus datos para generar tu boleta.
              </p>

              {/* Cart summary */}
              <div className="mb-5 space-y-2">
                {items.map((item) => (
                  <div
                    key={item.raffleId}
                    className="rounded-xl p-3"
                    style={{
                      background: 'rgba(212,175,55,0.04)',
                      border: '1px solid rgba(212,175,55,0.12)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white truncate pr-2">
                        {item.raffleTitle}
                      </span>
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: '#d4af37' }}>
                        ${formatN(item.numbers.length * item.pricePerTicket)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {item.numbers.map((n) => (
                        <span
                          key={n}
                          className="text-xs px-1.5 py-0.5 rounded font-semibold text-white"
                          style={{ background: 'var(--aris-red)' }}
                        >
                          {formatTicketNumber(n)}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.numbers.length} boleta(s) &middot; ${formatN(item.pricePerTicket)} c/u
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between px-1 pt-2">
                  <span className="text-sm text-gray-400">Total</span>
                  <span className="text-lg font-extrabold" style={{ color: '#d4af37' }}>
                    ${formatN(total)}
                  </span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
                    style={{ background: '#1a1a1a', border: '1px solid #333' }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Numero de telefono
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: 3001234567"
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
                    style={{ background: '#1a1a1a', border: '1px solid #333' }}
                  />
                </div>
              </div>

              <button
                onClick={handleFinish}
                disabled={!valid}
                className="mt-5 w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={
                  valid
                    ? {
                        background:
                          'linear-gradient(135deg,var(--aris-red),var(--aris-red-dark))',
                        border: '1px solid var(--aris-red-dark)',
                        boxShadow: '0 4px 18px rgba(122,18,18,0.4)',
                      }
                    : {
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        color: '#555',
                        cursor: 'not-allowed',
                      }
                }
              >
                Finalizar compra
              </button>
            </>
          ) : (
            <div className="text-center py-6">
              {/* SVG checkmark — no emoji */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-14 h-14 mx-auto mb-4"
                fill="none"
                stroke="#d4af37"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M7 12l3.5 3.5L17 8" />
              </svg>
              <h2 className="text-xl font-extrabold text-white mb-2">Compra procesada</h2>
              <p className="text-sm text-gray-400 mb-5">
                Tu boleta se abrio para guardar como PDF. Los detalles fueron enviados al
                administrador por WhatsApp.
              </p>
              <button
                onClick={onFinish}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'var(--aris-red)', border: '1px solid var(--aris-red-dark)' }}
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
