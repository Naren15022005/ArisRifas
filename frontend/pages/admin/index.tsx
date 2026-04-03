import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/AdminLayout'
import Toast from '../../components/Toast'
import dynamic from 'next/dynamic'
const AdminRaffleModal = dynamic(() => import('../../components/AdminRaffleModal'), { ssr: false })
const AdminRaffleTicketsModal = dynamic(() => import('../../components/AdminRaffleTicketsModal'), { ssr: false })
import Link from 'next/link'

import { getBackendBaseUrl, normalizeBackendAssetUrl } from '../../lib/backend'

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

export default function AdminDashboard() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [raffles, setRaffles] = useState<RaffleSummary[]>([])
  const [selected, setSelected] = useState<RaffleSummary | null>(null)
  const [talonarioRaffle, setTalonarioRaffle] = useState<RaffleSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alertMsg, setAlertMsg] = useState<string | null>(null)
  const [alertType, setAlertType] = useState<'success'|'error'|null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) {
      router.replace('/admin/login')
    } else {
      setChecking(false)
    }
  }, [router])

  function normalizeImage(path?: string) {
    return normalizeBackendAssetUrl(path)
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      const base = getBackendBaseUrl()
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      try {
        const res = await fetch(base + '/api/raffles/admin/all', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const serverList = res.ok ? await res.json() : []
        setRaffles(serverList)
      } catch (e: unknown) {
        setError('No se pudieron cargar las rifas (¿DB abajo?).')
        setRaffles([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (checking) return <div className="min-h-screen flex items-center justify-center">Cargando…</div>

  return (
    <AdminLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <Toast message={alertMsg} type={(alertType as any) || 'success'} onClose={() => setAlertMsg(null)} />
        <header className="mb-4 md:mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-red-300 mb-1">Panel de control</div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white mb-1">Dashboard de rifas</h1>
            <p className="text-sm text-gray-400">Administra rifas, talonarios y estados de publicación.</p>
          </div>
          <div className="w-full md:w-auto text-left md:text-right">
            <Link
              href="/admin/create"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-red-500 hover:bg-red-400 text-sm rounded-xl text-white shadow-sm shadow-red-500/40 transition-colors"
            >
              Crear rifa
            </Link>
          </div>
        </header>

        <section>
          {loading && <div className="text-sm text-gray-400">Cargando rifas…</div>}
          {error && <div className="mt-1 text-sm text-red-400">{error}</div>}

          {!loading && raffles.length === 0 && <div className="text-sm text-gray-500">No hay rifas aún.</div>}

          {!loading && raffles.length > 0 && (
            <div className="grid gap-3 sm:gap-4">
              {raffles.map((r) => (
                    <div
                      key={(r.id ?? Math.random())}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected(r)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(r) } }}
                      className="p-3 sm:p-4 bg-gradient-to-r from-[#111013] via-[#09070a] to-[#100808] rounded-xl border border-white/5 cursor-pointer hover:border-red-500/60 hover:shadow-[0_14px_40px_rgba(0,0,0,0.7)] flex items-center gap-3 sm:gap-4 transition-all"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#111] flex-shrink-0 border border-white/5">
                        <img src={normalizeImage(r.image || (r as any).imageUrl)} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm sm:text-base font-semibold text-white mb-0.5">{r.title}</div>
                            <div className="text-[11px] sm:text-xs text-gray-400 line-clamp-2 max-w-md">{r.description}</div>
                          </div>
                          <div className="text-right text-sm w-32 sm:w-40 flex-shrink-0">
                            <div className="inline-flex items-center justify-end gap-1 text-[11px] px-2 py-0.5 rounded-full border border-white/8 bg-white/5 text-gray-200">
                              <span
                                className={r.isPublished ? 'h-1.5 w-1.5 rounded-full bg-red-400' : 'h-1.5 w-1.5 rounded-full bg-yellow-300'}
                              />
                              <span>{r.isPublished ? 'Publicado' : 'Borrador'}</span>
                            </div>
                            <div className="mt-1 text-[11px] text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setTalonarioRaffle(r)
                            }}
                            className="px-3 py-1.5 text-[11px] rounded-lg bg-white/5 text-gray-100 border border-white/10 hover:bg-red-500/10 hover:border-red-400/60 transition-colors"
                          >
                            Gestión talonario
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          )}

          {selected && (
            <AdminRaffleModal
              raffle={selected}
              onClose={() => setSelected(null)}
              onSave={(updated) => {
                setRaffles((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)))
                setAlertType('success')
                setAlertMsg('Rifa actualizada')
                setSelected(null)
              }}
              onDelete={(id, source) => {
                setRaffles((prev) => prev.filter((x) => !(id && x.id === id)))
                setAlertType('success')
                setAlertMsg('Rifa eliminada')
              }}
            />
          )}

          {talonarioRaffle && (
            <AdminRaffleTicketsModal
              raffle={talonarioRaffle}
              onClose={() => setTalonarioRaffle(null)}
            />
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
