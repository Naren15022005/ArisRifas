import React, { useState, useRef } from 'react'

import { getBackendBaseUrl, normalizeBackendAssetUrl } from '../lib/backend'

type RaffleSummary = {
  id?: number
  title: string
  description?: string
  image?: string
  imageUrl?: string
  pricePerTicket?: number
  totalTickets?: number
  isPublished?: boolean
  createdAt?: string
}

type Props = {
  raffle: RaffleSummary
  onClose: () => void
  onSave: (r: RaffleSummary) => void
  onDelete: (id?: number, source?: string) => void
}

const ADMIN_MODAL_STYLE: React.CSSProperties = {
  background: '#0d0d0d',
  border: '1px solid rgba(255,255,255,0.04)',
}

function normalizeImage(path?: string) {
  return normalizeBackendAssetUrl(path)
}

export default function AdminRaffleModal({ raffle, onClose, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(raffle.title || '')
  const [desc, setDesc] = useState(raffle.description || '')
  const [price, setPrice] = useState<number>(Number(raffle.pricePerTicket ?? 0))
  const [total, setTotal] = useState<number>(Number(raffle.totalTickets ?? 0))
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    normalizeImage(raffle.image || (raffle as any).imageUrl),
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0]
    if (f) {
      setImageFile(f)
      setImagePreview(URL.createObjectURL(f))
    }
  }

  async function handleSave() {
    setSaving(true)
    const base = getBackendBaseUrl()
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    const id = raffle.id

    const payload = {
      title,
      description: desc,
      pricePerTicket: Math.round(price || 0),
      totalTickets: Math.round(total || 0),
    }

    try {
      // Crear rifa nueva si aún no tiene id
      if (!id) {
        const resCreate = await fetch(`${base}/api/raffles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ...payload, imageUrl: imagePreview }),
        })
        if (!resCreate.ok) throw new Error(await resCreate.text())
        const bodyCreate = await resCreate.json()
        const normalizedCreate = {
          ...bodyCreate,
          image: normalizeImage((bodyCreate as any).image || (bodyCreate as any).imageUrl),
        }
        setImagePreview(normalizedCreate.image)
        onSave(normalizedCreate)
        setEditing(false)
        return
      }

      // Actualizar con nueva imagen
      if (imageFile) {
        const fd = new FormData()
        fd.append('image', imageFile)
        fd.append('title', title)
        fd.append('description', desc)
        fd.append('pricePerTicket', String(Math.round(price || 0)))
        fd.append('totalTickets', String(Math.round(total || 0)))

        const resWithImage = await fetch(`${base}/api/raffles/${id}/with-image`, {
          method: 'PUT',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: fd,
        })
        if (!resWithImage.ok) throw new Error(await resWithImage.text())
        const body = await resWithImage.json()
        const normalized = {
          ...body,
          image: normalizeImage((body as any).image || (body as any).imageUrl),
        }
        setImagePreview(normalized.image)
        onSave(normalized)
        setEditing(false)
        return
      }

      // Actualizar solo datos
      const res = await fetch(`${base}/api/raffles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      const body = await res.json()
      const normalized = {
        ...body,
        image: normalizeImage((body as any).image || (body as any).imageUrl || raffle.image),
      }
      setImagePreview(normalized.image)
      onSave(normalized)
      setEditing(false)
    } catch (e) {
      console.error('Error saving raffle', e)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (raffle.id) {
      const base = getBackendBaseUrl()
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      try {
        const res = await fetch(`${base}/api/raffles/${raffle.id}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) throw new Error(await res.text())
        onDelete(raffle.id, 'server')
        onClose()
      } catch (e) {
        console.error('Error deleting raffle', e)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className="relative w-full max-w-3xl rounded-2xl p-4 sm:p-5 flex flex-col max-h-[90vh]"
        style={ADMIN_MODAL_STYLE}
      >
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-white">
          ✕
        </button>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 pr-8">
          {raffle.id ? 'Editar rifa' : 'Crear nueva rifa'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-auto pr-1">
          <div className="md:col-span-1 flex flex-col">
            <div className="mb-2 text-xs text-gray-400">Imagen</div>
            <div className="w-full h-40 sm:h-48 bg-[#111] rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
              <img
                src={imagePreview || '/images/placeholder.svg'}
                className="w-full h-full object-cover"
                alt={title || 'Imagen de la rifa'}
                onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/images/placeholder.svg'}}
              />
            </div>
            {editing && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#151515] text-xs font-semibold text-white border border-white/5 hover:bg-white/5"
                >
                  Seleccionar
                </button>
                <button
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(undefined)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-semibold text-gray-100 border border-gray-700 hover:bg-gray-700"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="text-xs text-gray-400">Título</label>
              <input
                value={title}
                disabled={!editing}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0b0b0b] text-white text-sm border border-white/5 focus:outline-none focus:ring-1 focus:ring-aris-gold"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Descripción</label>
              <textarea
                value={desc}
                disabled={!editing}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0b0b0b] text-white text-sm border border-white/5 focus:outline-none focus:ring-1 focus:ring-aris-gold min-h-[72px] resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400">Precio por boleto</label>
                <input
                  type="number"
                  value={price}
                  disabled={!editing}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0b0b0b] text-white text-sm border border-white/5 focus:outline-none focus:ring-1 focus:ring-aris-gold"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Cantidad de boletas</label>
                <input
                  type="number"
                  value={total}
                  disabled={!editing}
                  onChange={(e) => setTotal(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0b0b0b] text-white text-sm border border-white/5 focus:outline-none focus:ring-1 focus:ring-aris-gold"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2 border-t border-white/5">
          <div className="flex gap-2 sm:gap-3 flex-1">
            <button
              onClick={() => {
                if (editing) handleSave()
                else setEditing(true)
              }}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl font-bold text-sm text-white flex-1 sm:flex-none text-center"
              style={{ background: editing ? 'var(--aris-green, #1f8f3b)' : 'var(--aris-red)' }}
            >
              {editing ? (saving ? 'Guardando…' : 'Guardar cambios') : 'Editar rifa'}
            </button>
            {raffle.id && (
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl bg-gray-800 text-sm font-semibold text-red-200 border border-red-900/50 hover:bg-red-900/30"
              >
                Eliminar
              </button>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3 justify-between sm:justify-end mt-1 sm:mt-0">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-aris-gold border border-aris-gold/40 bg-transparent hover:bg-aris-gold/10"
            >
              Vista previa
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-transparent border border-[#222] text-sm font-semibold text-gray-300 hover:bg-white/5"
            >
              Cerrar
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="fixed inset-0 z-70 flex items-center justify-center px-4 py-6">
            <div className="absolute inset-0 bg-black/80" onClick={() => setShowPreview(false)} />
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-aris-gold/40 bg-gradient-to-b from-[#0b0f13] to-[#050607]">
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white text-sm z-10"
              >
                ✕
              </button>
              <div className="w-full h-40 sm:h-48 overflow-hidden">
                <img
                  src={imagePreview || '/images/placeholder.svg'}
                  alt={title || 'Vista previa de rifa'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex flex-col gap-2">
                <h4 className="text-lg font-extrabold text-white leading-tight">{title || 'Título de la rifa'}</h4>
                {desc && <p className="text-xs text-gray-300 line-clamp-3 mb-1">{desc}</p>}
                <div className="flex items-center justify-between text-xs text-gray-300 mt-1">
                  <span>
                    Precio:
                    <span className="ml-1 text-white font-semibold">
                      ${Number(price || 0).toLocaleString()}
                    </span>
                  </span>
                  <span>
                    Boletas:
                    <span className="ml-1 text-white font-semibold">{total || 0}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
