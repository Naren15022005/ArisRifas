import React, { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminRegister() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !email.trim() || !password) {
      setError('Todos los campos son obligatorios')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(body?.message || 'No se pudo crear el admin')
        setLoading(false)
        return
      }
      // persist token and go to dashboard (backend returns access_token)
      const token = body.token || body.access_token
      if (token) localStorage.setItem('admin_token', token)
      router.push('/admin')
    } catch (e) {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070707] px-4">
      <div className="w-full max-w-md p-6 rounded-2xl" style={{ background: '#0d0d0d', border: '1px solid rgba(212,175,55,0.06)' }}>
        <h1 className="text-2xl font-extrabold text-white mb-4">Admin — Registro inicial</h1>
        <p className="text-xs text-gray-500 mb-1">Esta pantalla sólo debe usarse para crear el primer usuario administrador.</p>
        <p className="text-[11px] text-gray-500 mb-4">La contraseña debe tener mínimo 12 caracteres e incluir letras, números y símbolos.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col text-sm text-gray-300">
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 p-2 rounded-lg bg-[#0b0b0b] border border-[#222] text-white" />
          </label>
          <label className="flex flex-col text-sm text-gray-300">
            Correo
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 p-2 rounded-lg bg-[#0b0b0b] border border-[#222] text-white" />
          </label>
          <label className="flex flex-col text-sm text-gray-300">
            Contraseña
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 p-2 rounded-lg bg-[#0b0b0b] border border-[#222] text-white" />
          </label>
          <label className="flex flex-col text-sm text-gray-300">
            Confirmar contraseña
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-2 p-2 rounded-lg bg-[#0b0b0b] border border-[#222] text-white" />
          </label>

          {error && <div className="text-xs text-red-400">{error}</div>}

          <div className="flex flex-col gap-2 mt-2">
            <button type="submit" disabled={loading} className="py-2 rounded-xl font-bold text-white" style={{ background: 'var(--aris-red)', border: '1px solid var(--aris-red-dark)' }}>
              {loading ? 'Creando…' : 'Crear admin'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/login')}
              className="py-2 rounded-xl text-sm text-gray-300 border border-[#222] bg-transparent"
            >
              Volver al login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
