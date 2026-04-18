import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Toast from '../../components/Toast'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg = body?.message || 'Credenciales inválidas'
        setError(msg)
        setToastType('error')
        setToastMsg(msg)
        setLoading(false)
        return
      }

      const body = await res.json()
      // persist a simple token for client-side guard
      localStorage.setItem('admin_token', body.token)
      setToastType('success')
      setToastMsg('Inicio de sesión exitoso')
      router.push('/admin')
    } catch (e) {
      const msg = 'Error de conexión'
      setError(msg)
      setToastType('error')
      setToastMsg(msg)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070707] px-4 relative">
      <Toast
        message={toastMsg}
        type={toastType}
        onClose={() => setToastMsg(null)}
      />
      <div className="w-full max-w-md p-6 rounded-2xl" style={{ background: '#0d0d0d', border: '1px solid rgba(212,175,55,0.06)' }}>
        <h1 className="text-2xl font-extrabold text-white mb-4">Admin — Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col text-sm text-gray-300">
            Usuario
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 p-2 rounded-lg bg-[#0b0b0b] border border-[#222] text-white" />
          </label>
          <label className="flex flex-col text-sm text-gray-300">
            Contraseña
            <div className="relative mt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 p-2 rounded-lg bg-[#0b0b0b] border border-[#222] text-white"
                aria-label="Contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7 1.02-2.2 2.74-4.02 4.78-5.18" />
                    <path d="M1 1l22 22" />
                    <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {error && <div className="text-xs text-red-400">{error}</div>}

          <div className="mt-2">
            <button type="submit" disabled={loading} className="w-full py-2 rounded-xl font-bold text-white" style={{ background: 'var(--aris-red)', border: '1px solid var(--aris-red-dark)' }}>
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
