import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/AdminLayout'
import RaffleCard from '../../components/RaffleCard'

import { getBackendBaseUrl } from '../../lib/backend'

type RaffleForm = {
  title: string
  short: string
  image: string
  price: number | string
  total: number | string
  estimatedValue?: number | string
  associatedLottery?: string
  endsAt: string
}

export default function AdminCreate() {
  const router = useRouter()
  const [form, setForm] = useState<RaffleForm>({ title: '', short: '', image: '/images/placeholder.svg', price: '', total: '', estimatedValue: '', associatedLottery: '', endsAt: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  function handleChange<K extends keyof RaffleForm>(key: K, value: any) {
    setForm((s) => ({ ...s, [key]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0]
    if (f) {
      setImageFile(f)
      setImagePreview(URL.createObjectURL(f))
    } else {
      setImageFile(null)
      setImagePreview(null)
    }
  }

  function loadStored() {
    try {
      const raw = localStorage.getItem('admin_raffles')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  }

  function saveRaffle(obj: any) {
    const arr = loadStored()
    arr.unshift(obj)
    localStorage.setItem('admin_raffles', JSON.stringify(arr))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.title.trim()) return setError('El título es requerido')
    if (form.price === '' || Number(form.price) <= 0) return setError('Precio inválido')
    if (form.total === '' || Number(form.total) <= 0) return setError('Cantidad de boletas inválida')
    if (form.endsAt) {
      const draw = new Date(form.endsAt)
      if (isNaN(draw.getTime()) || draw.getTime() <= Date.now()) return setError('La fecha "Cuando juega" debe ser futura')
    }
    // estimatedValue optional but if provided must be positive
    if (form.estimatedValue !== undefined && form.estimatedValue !== '' && Number(form.estimatedValue) < 0) return setError('Valor estimado inválido')

    setSaving(true)

    const base = getBackendBaseUrl() + '/api/raffles'
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

    if (imageFile) {
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('title', form.title.trim())
      formData.append('description', form.short.trim())
      if (form.estimatedValue !== undefined && form.estimatedValue !== '') formData.append('estimatedValue', String(form.estimatedValue))
      formData.append('pricePerTicket', String(Math.round(Number(form.price))))
      formData.append('totalTickets', String(Math.round(Number(form.total))))
      if (form.associatedLottery) formData.append('associatedLottery', String(form.associatedLottery))
      if (form.endsAt) formData.append('drawDate', new Date(form.endsAt).toISOString())
      else formData.append('drawDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      formData.append('isPublished', 'true')

      fetch(base + '/with-image', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await res.text())
          return res.json()
        })
        .then((data) => {
          setSaving(false)
          setModal({ type: 'success', message: 'Rifa creada correctamente' })
          // redirect to admin dashboard which fetches server list
          setTimeout(() => router.push('/admin'), 900)
        })
        .catch((err) => {
          console.error(err)
          // fallback: save locally so admin can recover the draft
          try { saveRaffle({
            title: form.title.trim(),
            description: form.short.trim(),
            image: form.image.trim() || '/images/placeholder.svg',
            pricePerTicket: Math.round(Number(form.price)),
            totalTickets: Math.round(Number(form.total)),
            createdAt: new Date().toISOString(),
            isPublished: false,
          }) } catch (e) { /* ignore */ }
          setError('Error guardando la rifa en el servidor; se ha guardado localmente')
          setModal({ type: 'error', message: 'Error guardando la rifa en el servidor; borrador guardado localmente' })
          setSaving(false)
        })
    } else {
      const payload = {
        title: form.title.trim(),
        description: form.short.trim(),
        imageUrl: form.image.trim() || '/images/placeholder.svg',
        estimatedValue: form.estimatedValue === '' || form.estimatedValue === undefined ? undefined : Number(form.estimatedValue),
        pricePerTicket: Math.round(Number(form.price)),
        totalTickets: Math.round(Number(form.total)),
        associatedLottery: form.associatedLottery || undefined,
        drawDate: form.endsAt ? new Date(form.endsAt).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isPublished: true,
      }

      fetch(base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await res.text())
          return res.json()
        })
        .then((data) => {
          setSaving(false)
          setModal({ type: 'success', message: 'Rifa creada correctamente' })
          setTimeout(() => router.push('/admin'), 900)
        })
        .catch((err) => {
          console.error(err)
          try { saveRaffle(payload) } catch (e) { /* ignore */ }
          setError('Error guardando la rifa en el servidor; se ha guardado localmente')
          setModal({ type: 'error', message: 'Error guardando la rifa en el servidor; borrador guardado localmente' })
          setSaving(false)
        })
    }
  }

  const totalNum = form.total === '' ? 100 : Number(form.total)
  const previewRaffle = {
    id: 0,
    title: form.title || 'Título de la rifa',
    short: form.short || 'Descripción corta del premio',
    image: (imagePreview as string) || form.image || '/images/placeholder.svg',
    price: form.price === '' ? 0 : Number(form.price),
    total: totalNum,
    remaining: totalNum,
    endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
    estimatedValue:
      form.estimatedValue === '' || form.estimatedValue === undefined
        ? undefined
        : Number(form.estimatedValue),
    associatedLottery: form.associatedLottery || undefined,
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Crear rifas</h2>
          </div>
        </div>

        <div className="max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="bg-[#0b0b0b] p-6 rounded-2xl border border-[#1a1a1a] flex flex-col"
          >
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300">Título</label>
                  <input
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="mt-2 w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#222] text-white"
                    placeholder="Ej: Rifa Smart TV 50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300">Precio por boleto</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      form.price === ''
                        ? ''
                        : new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(
                            Number(form.price),
                          )
                    }
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, '')
                      handleChange('price', digits === '' ? '' : Number(digits))
                    }}
                    className="mt-2 w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#222] text-white"
                    placeholder="Ej: 10.000"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-300">Valor estimado (opcional)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    form.estimatedValue === '' || form.estimatedValue === undefined
                      ? ''
                      : new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(
                          Number(form.estimatedValue),
                        )
                  }
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^0-9]/g, '')
                    handleChange('estimatedValue', digits === '' ? '' : Number(digits))
                  }}
                  className="mt-2 w-full p-3 rounded-lg bg-[#0b0b0b] border border-[#1a1a1a] text-white placeholder-gray-400 focus:outline-none"
                  placeholder="Ej: 50.000"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-300">Descripción corta</label>
                <input
                  value={form.short}
                  onChange={(e) => handleChange('short', e.target.value)}
                  className="mt-2 w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#222] text-white"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-300">Añadir imagen</label>
                <div className="mt-2 relative">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3H8l-2 4h12l-2-4z"
                        />
                      </svg>
                    </div>
                    <input
                      value={imageFile ? imageFile.name : form.image}
                      onChange={(e) => {
                        if (!imageFile) handleChange('image', e.target.value)
                      }}
                      placeholder="/images/placeholder.svg"
                      className="w-full pl-10 pr-32 p-3 rounded-lg bg-[#0b0b0b] border border-[#1a1a1a] text-white placeholder-gray-400 focus:outline-none"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {imageFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
                          }}
                          className="px-3 py-1 rounded-md bg-transparent text-sm text-gray-300 border border-transparent hover:bg-[#0f0f0f]"
                        >
                          Quitar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 rounded-md bg-[#151515] text-sm text-gray-200 border border-[#1a1a1a] hover:brightness-110"
                      >
                        Seleccionar
                      </button>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-300">Cantidad de boletas</label>
                <input
                  type="number"
                  value={form.total}
                  onChange={(e) =>
                    handleChange('total', e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="mt-2 w-full p-3 rounded-lg bg-[#0b0b0b] border border-[#1a1a1a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aris-red"
                  placeholder="Ej: 100"
                  min={1}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-300">Cuando juega (opcional)</label>
                <input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => handleChange('endsAt', e.target.value)}
                  className="mt-2 w-full p-3 rounded-lg bg-[#0b0b0b] border border-[#1a1a1a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aris-red"
                  min={new Date(new Date().getTime() + 60 * 1000).toISOString().slice(0, 16)}
                />
                <div className="text-xs text-gray-500 mt-1">La fecha debe ser posterior a ahora.</div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-300">Lotería asociada (opcional)</label>
                <input
                  type="text"
                  value={form.associatedLottery ?? ''}
                  onChange={(e) => handleChange('associatedLottery', e.target.value)}
                  className="mt-2 w-full p-3 rounded-lg bg-[#0b0b0b] border border-[#1a1a1a] text-white placeholder-gray-400 focus:outline-none"
                  placeholder="Ej: Lotería Nacional"
                />
              </div>

              {error && <div className="text-sm text-red-400 mt-4">{error}</div>}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-aris-gold border border-aris-gold/40 bg-transparent hover:bg-aris-gold/10"
              >
                Vista previa
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 rounded-xl font-bold text-white shadow-md"
                style={{
                  background: 'linear-gradient(180deg,#b71c1c,#7a0f0f)',
                  border: '1px solid rgba(0,0,0,0.4)',
                }}
              >
                {saving ? 'Guardando…' : 'Crear rifa'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-300 border bg-transparent"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setModal(null)} />
            <div className="relative bg-[#0b0b0b] border border-[#222] rounded-xl p-6 w-full max-w-md text-center">
              <div className="mb-3">
                {modal.type === 'success' ? (
                  <div className="text-3xl font-bold text-green-400">✓</div>
                ) : (
                  <div className="text-3xl font-bold text-red-400">✕</div>
                )}
              </div>
              <div className="text-white mb-4">{modal.message}</div>
              <div className="flex justify-center gap-3">
                {modal.type === 'success' ? (
                  <button
                    onClick={() => router.push('/admin')}
                    className="px-4 py-2 rounded-lg bg-[#1f8f3b] text-white"
                  >
                    Ir al dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => setModal(null)}
                    className="px-4 py-2 rounded-lg bg-transparent border border-[#333] text-white"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showPreview && (
          <div className="fixed inset-0 z-40 flex items-center justify-center px-4 py-6">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowPreview(false)} />
            <div className="relative w-full max-w-md">
              <div className="mb-3 flex justify-between items-center text-sm text-gray-300">
                <span>Vista previa de la rifa</span>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <RaffleCard raffle={previewRaffle} variant="vertical" />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
