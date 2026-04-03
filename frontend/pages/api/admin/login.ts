import type { NextApiRequest, NextApiResponse } from 'next'

import { getBackendBaseUrl } from '../../../lib/backend'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  const { email, password } = req.body || {}

  if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

  try {
    const base = getBackendBaseUrl()
    console.log('Admin login proxy: base=', base)
    const upstream = await fetch(base + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const text = await upstream.text().catch(() => '')
    let data: any = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch (parseErr) {
      data = { raw: text }
    }
    console.log('Admin login proxy: upstream status=', upstream.status, 'ok=', upstream.ok, 'body=', data)

    if (!upstream.ok) {
      return res.status(upstream.status).json({ message: data?.message || 'Invalid credentials', upstreamBody: data })
    }

    // Backend returns { access_token }; expose as { token } to keep frontend code unchanged
    return res.status(200).json({ token: (data as any).access_token })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error contacting auth server'
    console.error('Admin login proxy failed:', e)
    return res.status(500).json({ message })
  }
}
