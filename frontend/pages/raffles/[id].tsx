import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { api, generateIdempotencyKey } from '../../lib/api'

type Ticket = {
  id: number
  seat?: string
  status: string
}

type Raffle = {
  id: number
  title: string
  description?: string
}

export default function RafflePage() {
  const router = useRouter()
  const { id } = router.query
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [lastPurchaseId, setLastPurchaseId] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    api.get(`/api/raffles/${id}`).then(r => setRaffle(r.data)).catch(() => {})
    api.get(`/api/raffles/${id}/tickets`).then(r => setTickets(r.data)).catch(() => {})
  }, [id])

  async function handleReserve() {
    setLoading(true)
    setMessage(null)
    try {
      const key = generateIdempotencyKey()
      const res = await api.post('/api/purchases/reserve', { userId: 1, raffleId: Number(id), quantity }, { headers: { 'idempotency-key': key } })
      setLastPurchaseId(res.data.purchaseId)
      setMessage(`Reservado: purchaseId=${res.data.purchaseId}. TTL=${res.data.ttlSeconds}s`)
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Error reservando')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckout() {
    if (!lastPurchaseId) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await api.post(`/api/payments/${lastPurchaseId}/checkout`)
      const { checkoutUrl } = res.data
      if (checkoutUrl) window.open(checkoutUrl, '_blank')
      else setMessage('Checkout creado, pero no se devolvió URL')
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Error creando checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full px-4 lg:px-8">
      <button className="text-sm text-aris-gold mb-4" onClick={() => router.push('/')}>← Volver</button>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">{raffle?.title || 'Rifa'}</h1>
        {raffle?.description && <p className="text-sm text-gray-600">{raffle.description}</p>}
      </header>

      <section className="mb-6">
        <h2 className="font-semibold">Boletos disponibles</h2>
        <ul className="mt-2 space-y-2">
          {tickets.map(t => (
            <li key={t.id} className="p-2 bg-white rounded shadow-sm flex justify-between">
              <div>
                <div className="text-sm">Boleto #{t.id}</div>
                <div className="text-xs text-gray-500">{t.status}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Reservar boletos</h3>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm">Cantidad:</label>
          <input type="number" min={1} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="border rounded px-2 py-1 w-20" />
        </div>
        <button onClick={handleReserve} disabled={loading} className="text-white px-4 py-2 rounded" style={{ background: 'var(--aris-red)', border: '1px solid var(--aris-red-dark)' }}>
          {loading ? 'Reservando...' : 'Reservar'}
        </button>
        {lastPurchaseId && (
          <button onClick={handleCheckout} disabled={loading} className="ml-3 bg-green-600 text-white px-4 py-2 rounded">
            {loading ? 'Procesando...' : 'Ir al checkout'}
          </button>
        )}
        {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
      </section>
    </div>
  )
}
