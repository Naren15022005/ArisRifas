import React from 'react'
import useSWR from 'swr'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import RaffleGrid from '../components/RaffleGrid'
import BackgroundEffects from '../components/BackgroundEffects'

export default function RifasPage() {
  // Dedicated env var for backend *function* base (e.g. Supabase Edge Function URL).
  // Keep it separate from NEXT_PUBLIC_BACKEND_URL (which commonly points to the render backend).
  const backendFnBase = process.env.NEXT_PUBLIC_BACKEND_FUNCTION_URL?.replace(/\/+$/, '')
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const fetcher = (url: string) => {
    // If a production backend *function* URL is set, map the internal API path
    // '/api/raffles' to the function path '/raffles'. Otherwise use the API server.
    const resolved = backendFnBase
      ? `${backendFnBase}${url.replace(/^\/api\/raffles/, '/raffles')}`
      : `${apiBase}${url}`
    return fetch(resolved).then((r) => (r.ok ? r.json() : []))
  }
  const { data: raffles = [] } = useSWR('/api/raffles', fetcher, { refreshInterval: 15000, revalidateOnFocus: false, dedupingInterval: 5000 })

  // Rifas que alcanzaron >=50% vendidas — se muestran en el carrusel
  const featuredRaffles = raffles.filter((r: any) => {
    const total = Number(r.total ?? r.totalTickets ?? 0) || 0
    const remaining = Number(r.remaining ?? total) || 0
    const sold = Math.max(0, total - remaining)
    return total > 0 && sold / total >= 0.5
  })

  return (
    <div className="min-h-screen bg-home-composed relative overflow-hidden">
      <BackgroundEffects />
      <div className="relative z-20 w-full">
        <Nav />
      </div>

      <main className="w-full mx-auto px-2 py-4">
        {/* Carousel intentionally removed to avoid showing temporary preview cards */}

        <section className="w-full bg-transparent pt-6 pb-16">
          <div className="max-w-full md:max-w-7xl mx-auto px-2 md:px-6 relative z-30 pt-2 sm:pt-0">
            <h2 className="mb-4">
              <span className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-aris-gold font-bold text-lg">
                <span className="w-2 h-2 rounded-full bg-aris-gold inline-block" aria-hidden="true" />
                Todas las rifas
              </span>
            </h2>
            <div id="rifas">
              <RaffleGrid items={raffles} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
