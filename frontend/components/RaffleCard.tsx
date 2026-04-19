import React, { useMemo, useState, useEffect } from 'react'
import useNow from '../hooks/useNow'
import { normalizeBackendAssetUrl } from '../lib/backend'

// Style constants to avoid recreating inline objects on every render
const CARD_STYLE = { background: '#0d0d0d', border: '1px solid rgba(212,175,55,0.15)' } as const
const BOX_STYLE = { background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)' } as const
const PROGRESS_TRACK_STYLE = { background: 'rgba(255,255,255,0.06)' } as const
const PROGRESS_INNER_TRANSITION = { transition: 'width 0.4s ease' } as const
const CTA_PRIMARY_STYLE = { background: 'var(--aris-red)', border: '1px solid var(--aris-red-dark)' } as const
const CTA_SECONDARY_STYLE = { background: 'transparent', border: '1px solid #2e2e2e' } as const
const IMAGE_BG_STYLE = { background: '#111' } as const
const FOOTER_STYLE = { borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' } as const
const GOLD_STYLE = { color: '#d4af37' } as const

function resolveImageSrc(img?: string, imgUrl?: string) {
  const raw = img || imgUrl
  if (!raw) return '/images/placeholder.svg'
  const s = String(raw).trim()
  // Delegate to centralized normalizer which handles full URLs, leading/trailing slashes
  return normalizeBackendAssetUrl(s)
}

type Props = {
  raffle: {
    id: number
    title: string
    short?: string
    // backend may return `imageUrl` instead of `image`
    image?: string
    imageUrl?: string
    estimatedValue?: number | string
    associatedLottery?: string
    // backend may return `pricePerTicket` (string) instead of `price`
    price?: number | string
    pricePerTicket?: number | string
    // backend may return `totalTickets` instead of `total`
    total?: number
    totalTickets?: number
    // remaining may be absent; we'll derive a fallback
    remaining?: number
    endsAt?: string | number
  }
  variant?: 'horizontal' | 'vertical'
}

function formatRemaining(ms: number, includeSeconds = true) {
  if (ms <= 0) return 'Sorteo finalizado'
  const s = Math.floor(ms / 1000)
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const mins = Math.floor((s % 3600) / 60)
  const secs = s % 60
  const secStr = includeSeconds ? String(secs).padStart(2, '0') : '00'
  return `${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${secStr}s`
}

function formatNumber(n: number) {
  // Deterministic thousands separator (dot) to avoid SSR/CSR Intl differences
  return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function formatCurrency(value: number | string | undefined) {
  if (value === undefined || value === null) return ''
  const n = Number(value)
  if (Number.isNaN(n)) return ''
  const fixed = n.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const intFmt = String(intPart).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  if (decPart === '00') return intFmt
  return `${intFmt},${decPart}`
}

function RaffleCard({ raffle, variant = 'horizontal' }: Props) {
  const totalNum = Number(raffle.total ?? raffle.totalTickets ?? 0) || 0
  const remainingNum = Number(raffle.remaining ?? totalNum) || 0
  const priceVal = Number(raffle.price ?? raffle.pricePerTicket ?? 0) || 0
  const priceDisplay = formatCurrency(priceVal)
  const sold = Math.max(0, totalNum - remainingNum)
  const pct = totalNum > 0 ? Math.round((sold / totalNum) * 100) : 0

  // determine target end timestamp: accept multiple backend field names and formats
  const target = useMemo(() => {
    // potential fields the backend might use
    const candidates: Array<string | number | undefined> = [
      raffle.endsAt,
      // some APIs call it drawDate / draw_date / drawAt
      (raffle as any).drawDate,
      (raffle as any).draw_date,
      (raffle as any).drawAt,
      (raffle as any).draw_timestamp,
      (raffle as any).drawTs,
    ]

    for (const raw of candidates) {
      if (raw === undefined || raw === null) continue
      // numeric timestamps (ms) or numeric strings
      if (typeof raw === 'number') {
        if (!isNaN(raw)) return raw
        continue
      }
      const s = String(raw).trim()
      if (s === '') continue
      // plain numeric string
      if (/^\d+$/.test(s)) {
        const n = Number(s)
        if (!isNaN(n)) return n
      }
      // ISO or other date string
      const parsed = Date.parse(s)
      if (!isNaN(parsed)) return parsed
    }

    // fallback mock: deterministic per-id so previews are stable
    const days = raffle.id * 2 + 1
    return Date.now() + days * 24 * 60 * 60 * 1000
  // include common candidate props so memo updates when backend fills them
  }, [
    raffle.id,
    raffle.endsAt,
    (raffle as any).drawDate,
    (raffle as any).draw_date,
    (raffle as any).drawAt,
    (raffle as any).draw_timestamp,
    (raffle as any).drawTs,
  ])

  // Use a shared single timer hook to avoid creating many intervals
  const now = useNow()
  const remaining = Math.max(0, target - (now ?? Date.now()))
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Normalize any occurrence of "Entradas"/"Entrada" coming from the short text
  const displayShort = raffle.short
    ? String(raffle.short).replace(/\bEntradas\b/gi, 'Boletas').replace(/\bEntrada\b/gi, 'Boleta')
    : undefined

  if (variant === 'vertical') {
    const content = (
      <article className="h-full flex flex-col rounded-2xl overflow-hidden relative" style={CARD_STYLE}>
        {((raffle as any).published || (raffle as any).status === 'published' || (raffle as any).publishedAt) && (
          <div className="absolute left-3 top-3 px-3 py-1 rounded-full bg-[#111] border border-white/10 text-xs text-white">{(raffle as any).publishedText || 'Publicado'}</div>
        )}
        {/* Image on top */}
        <div className="relative w-full h-40 sm:h-56 bg-[#111] overflow-hidden">
          <img loading="lazy" src={resolveImageSrc(raffle.image, raffle.imageUrl)} alt={raffle.title} className="w-full h-full object-cover" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/images/placeholder.svg'}} />
        </div>

        {/* Content below */}
        <div className="flex-1 p-6 pt-10 pb-10 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-2xl lg:text-3xl text-white leading-tight">{raffle.title}</h3>
            {displayShort && <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{displayShort}</p>}

            <div className="mt-4 relative">
              <div className="flex items-center justify-between rounded-xl px-4 py-3" style={BOX_STYLE}>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Precio por boleto</div>
                  <div className="text-xl font-extrabold" style={GOLD_STYLE}>${priceDisplay}</div>
                {raffle.estimatedValue !== undefined && (
                  <div className="text-xs text-gray-400 mt-1">Valor estimado: ${formatCurrency(raffle.estimatedValue)}</div>
                )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Disponibles</div>
                  <div className="text-xl font-bold text-white">{remainingNum}</div>
                </div>
              </div>
              
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-widest">Vendidos</span>
                <span className="text-xs font-semibold" style={{ color: pct >= 90 ? 'var(--aris-red-dark)' : '#d4af37' }}>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={PROGRESS_TRACK_STYLE}>
                <div
                  style={{ ...PROGRESS_INNER_TRANSITION, width: `${pct}%`, background: pct >= 90 ? 'var(--aris-red)' : 'rgba(212,175,55,0.7)' }}
                  className="h-full rounded-full"
                />
              </div>
            </div>
            {raffle.associatedLottery && (
              <div className="mt-3 text-sm text-gray-400">Lotería asociada: {raffle.associatedLottery}</div>
            )}
          </div>

          <div className="mt-6">
            <div className="flex gap-3">
              <button type="button" aria-label={`Comprar ${raffle.title}`} className="flex-1 py-2.5 rounded-sm text-sm font-bold text-white" style={CTA_PRIMARY_STYLE}>Comprar</button>
              <button type="button" aria-label={`Detalles ${raffle.title}`} className="flex-1 py-2.5 rounded-sm text-sm font-semibold text-gray-400 hover:text-white transition-colors" style={CTA_SECONDARY_STYLE}>Detalles</button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-1">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Sorteo en</span>
            { !isMounted ? (
              <span className="text-base font-bold" style={{ ...GOLD_STYLE, fontVariantNumeric: 'tabular-nums' }} suppressHydrationWarning>
                —
              </span>
            ) : (
              <span className="text-base font-bold" style={{ ...GOLD_STYLE, fontVariantNumeric: 'tabular-nums' }}>
                {formatRemaining(remaining, true)}
              </span>
            ) }
          </div>
        </div>
        {raffle.endsAt && (
          <div className="absolute right-3 bottom-3 px-3 py-1 rounded-full bg-[#0b0b0b] border border-white/5 text-xs text-gray-300">
            {new Date(Number(raffle.endsAt)).toLocaleString()}
          </div>
        )}
      </article>
    )

    return content
  }

  // default horizontal layout (existing)
  const content = (
    <article className="h-full flex flex-col rounded-2xl overflow-hidden relative" style={CARD_STYLE}>
      {((raffle as any).published || (raffle as any).status === 'published' || (raffle as any).publishedAt) && (
        <div className="absolute left-3 top-3 px-3 py-1 rounded-full bg-[#111] border border-white/10 text-xs text-white">{(raffle as any).publishedText || 'Publicado'}</div>
      )}
      {/* ── Image + Info row ── */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 items-stretch h-full">

        {/* Info column */}
        <div className="order-2 sm:order-1 p-4 pt-10 pb-10 flex flex-col gap-4 h-full justify-between">

          {/* Title & description (header + meta) */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-extrabold text-xl sm:text-2xl lg:text-3xl text-white leading-tight max-h-[4.5rem] overflow-hidden">{raffle.title}</h3>
              {displayShort && (
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{displayShort}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between rounded-xl px-4 py-3" style={BOX_STYLE}>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Precio por boleto</div>
                <div className="text-xl font-extrabold" style={GOLD_STYLE}>${priceDisplay}</div>
                {raffle.estimatedValue !== undefined && (
                  <div className="text-xs text-gray-400 mt-1">Valor estimado: ${formatCurrency(raffle.estimatedValue)}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Disponibles</div>
                <div className="text-xl font-bold text-white">{remainingNum}</div>
              </div>
            </div>
            {/* Available number badge removed to avoid duplication */}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-widest">Vendidos</span>
              <span className="text-xs font-semibold" style={{ color: pct >= 90 ? 'var(--aris-red-dark)' : '#d4af37' }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={PROGRESS_TRACK_STYLE}>
              <div
                style={{ ...PROGRESS_INNER_TRANSITION, width: `${pct}%`, background: pct >= 90 ? 'var(--aris-red)' : 'rgba(212,175,55,0.7)' }}
                className="h-full rounded-full"
              />
            </div>
          </div>

          {raffle.associatedLottery && (
            <div className="mt-3 text-sm text-gray-400">Lotería asociada: {raffle.associatedLottery}</div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3 flex-col sm:flex-row items-center justify-center">
            <button
              type="button"
              aria-label={`Comprar ${raffle.title}`}
              className="flex-1 py-2 rounded-sm text-sm font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center max-w-xs"
              style={CTA_PRIMARY_STYLE}
            >
              Comprar
            </button>
            <button
              type="button"
              aria-label={`Detalles ${raffle.title}`}
              className="flex-1 py-2 rounded-sm text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center justify-center max-w-xs"
              style={CTA_SECONDARY_STYLE}
            >
              Detalles
            </button>
          </div>
        </div>

        {/* Image column */}
        <div className="order-1 sm:order-2 relative overflow-hidden h-40 sm:h-full" style={IMAGE_BG_STYLE}>
          <img
            loading="lazy"
            src={resolveImageSrc(raffle.image, raffle.imageUrl)}
            alt={raffle.title}
            className="w-full h-full object-cover"
            onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/images/placeholder.svg'}}
          />
          {/* Subtle gradient overlay at bottom of image */}
          <div className="absolute inset-x-0 bottom-0 h-16" style={{ background: 'linear-gradient(to top, #0d0d0d, transparent)' }} />
        </div>
      </div>

      {raffle.endsAt && (
        <div className="absolute right-3 bottom-3 px-3 py-1 rounded-full bg-[#0b0b0b] border border-white/5 text-xs text-gray-300">
          {new Date(Number(raffle.endsAt)).toLocaleString()}
        </div>
      )}

      {/* ── Countdown footer ── */}
      <div className="flex items-center justify-between px-6 py-2" style={FOOTER_STYLE}>
        <span className="text-xs text-gray-500 uppercase tracking-widest">Sorteo en</span>
        { !isMounted ? (
          <span className="text-base font-bold" style={{ ...GOLD_STYLE, fontVariantNumeric: 'tabular-nums' }} suppressHydrationWarning>
            —
          </span>
        ) : (
          <span className="text-base font-bold" style={{ ...GOLD_STYLE, fontVariantNumeric: 'tabular-nums' }}>
            {formatRemaining(remaining, true)}
          </span>
        ) }
      </div>
    </article>
  )

  return content
}

const raffleCardComparator = (a: Props, b: Props) => {
  const ra = a.raffle
  const rb = b.raffle
  return (
    ra.id === rb.id &&
    (Number(ra.remaining ?? ra.total ?? ra.totalTickets ?? 0) === Number(rb.remaining ?? rb.total ?? rb.totalTickets ?? 0)) &&
    (String(ra.price ?? ra.pricePerTicket ?? '') === String(rb.price ?? rb.pricePerTicket ?? '')) &&
    (String(ra.title ?? '') === String(rb.title ?? '')) &&
    (String(ra.image ?? ra.imageUrl ?? '') === String(rb.image ?? rb.imageUrl ?? '')) &&
    a.variant === b.variant
  )
}

export default React.memo(RaffleCard, raffleCardComparator)
