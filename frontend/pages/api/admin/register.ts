import type { NextApiRequest, NextApiResponse } from 'next'

import { getBackendBaseUrl } from '../../../lib/backend'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  const { email, password, name } = req.body || {}

  if (!email || !password || !name) return res.status(400).json({ message: 'Email, name and password required' })

  try {
    const base = getBackendBaseUrl()
    const upstream = await fetch(base + '/api/admin/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    const data = await upstream.json().catch(() => ({} as any))
    if (!upstream.ok) {
      return res.status(upstream.status).json({ message: data?.message || 'No se pudo registrar el admin' })
    }

    // Backend returns { access_token }; expose as { token } so admin UI can reuse login handling
    return res.status(200).json({ token: (data as any).access_token })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error contacting auth server'
    console.error('Admin register proxy failed:', e)
    return res.status(500).json({ message })
  }
}
