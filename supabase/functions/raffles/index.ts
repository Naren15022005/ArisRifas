import { serve } from 'https://deno.land/std@0.201.0/http/server.ts'

// Simple Edge Function that proxies a GET request to Supabase REST to fetch `raffles` rows.
// Requires the following environment variables to be set in the Supabase Function settings:
// - SUPABASE_URL (e.g. https://your-project.supabase.co)
// - SUPABASE_SERVICE_ROLE_KEY (service role key, keep secret)

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_PROJECT_URL')
// Prefer service role key but fallback to anon key if needed (useful when SRK is not set)
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')

serve(async (req) => {
  if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 })
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('raffles: missing SUPABASE_URL or SERVICE_ROLE_KEY / ANON_KEY')
    return new Response(JSON.stringify({ error: 'Supabase env not configured (missing SUPABASE_URL or keys)' }), { status: 500 })
  }

  try {
    console.log('raffles: invoked')
    console.log('raffles: SUPABASE_URL present=', !!SUPABASE_URL)
    console.log('raffles: SERVICE_ROLE_KEY present=', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
    console.log('raffles: ANON_KEY present=', !!Deno.env.get('SUPABASE_ANON_KEY'))

    const url = new URL('/rest/v1/raffles', SUPABASE_URL)
    // You can modify select/filter params as needed. Here we select all columns.
    url.searchParams.set('select', '*')
    const keyToUse = SERVICE_ROLE_KEY
    console.log('raffles: using key type=', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'service_role' : (Deno.env.get('SUPABASE_ANON_KEY') ? 'anon' : 'none'))
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        apikey: keyToUse,
        Authorization: `Bearer ${keyToUse}`,
        Accept: 'application/json'
      }
    })

    console.log('raffles: upstream status=', res.status)

    const data = await res.text()
    if (!res.ok) {
      console.error('raffles: upstream response error:', data)
      return new Response(JSON.stringify({ error: 'Upstream fetch failed', status: res.status }), { status: 502 })
    }

    return new Response(data, { status: res.status, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('raffles: runtime error', String(err))
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
