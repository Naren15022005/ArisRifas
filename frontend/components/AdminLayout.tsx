import React, { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      router.replace('/admin/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050509] via-[#050708] to-[#020314] text-white">
      <div className="relative border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 border border-red-400/40 text-red-300 font-semibold text-sm">
                  AR
                </span>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Panel</div>
                  <div className="font-semibold text-sm text-gray-50">ArisRifas Admin</div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 ml-6">
                <button
                  onClick={() => router.push('/admin')}
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-gray-100 hover:bg-white/10 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/admin/create')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-400 transition-colors shadow-sm shadow-red-500/30"
                >
                  Crear rifas
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <button
                  onClick={handleLogout}
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>

              <div className="md:hidden">
                <button
                  aria-label="Abrir menú"
                  onClick={() => setMenuOpen((s) => !s)}
                  className="p-2 rounded-md bg-transparent border border-white/10 hover:bg-white/5"
                >
                  {menuOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-black/90 border-t border-white/10 backdrop-blur-sm">
            <div className="px-4 py-3 flex flex-col gap-2">
              <button
                onClick={() => { setMenuOpen(false); router.push('/admin') }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-100 border border-white/10 bg-white/5 hover:bg-white/10"
              >
                Dashboard
              </button>
              <button
                onClick={() => { setMenuOpen(false); router.push('/admin/create') }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-white bg-red-500 hover:bg-red-400"
              >
                Crear rifas
              </button>
              <button
                onClick={() => { setMenuOpen(false); handleLogout() }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-300 border border-white/10 hover:bg-white/5"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-3 sm:px-4 py-4 sm:py-6 max-w-6xl mx-auto">
        <div className="rounded-2xl border border-white/5 bg-black/30 shadow-[0_18px_45px_rgba(0,0,0,0.6)]">
          {children}
        </div>
      </div>
    </div>
  )
}
