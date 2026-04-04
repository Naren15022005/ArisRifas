import { serve } from 'https://deno.land/std@0.201.0/http/server.ts'

// Simple Edge Function that proxies a GET request to Supabase REST to fetch `raffles` rows.
// Requires the following environment variables to be set in the Supabase Function settings:
// - SUPABASE_URL (e.g. https://your-project.supabase.co)
// - SUPABASE_SERVICE_ROLE_KEY (service role key, keep secret)

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_PROJECT_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 })
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Supabase env not configured' }), { status: 500 })
  }

  try {
    const url = new URL('/rest/v1/raffles', SUPABASE_URL)
    // You can modify select/filter params as needed. Here we select all columns.
    url.searchParams.set('select', '*')

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Accept: 'application/json'
      }
    })

    const data = await res.text()
    return new Response(data, { status: res.status, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
