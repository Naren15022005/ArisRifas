import React from 'react'

export default function PromoBanner(){
  return (
    <section className="w-full px-4 lg:px-8 my-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl p-12 md:p-16 lg:p-20" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.55))', border: '1px solid rgba(212,175,55,0.08)' }}>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Tu próximo premio
              <span className="block text-aris-gold mt-2" style={{ color: 'var(--aris-gold)', fontSize: '2.25rem' }}>está a un boleto</span>
            </h2>
            <p className="mt-4 text-sm md:text-base text-gray-300 max-w-2xl mx-auto">Miles de participantes ya están jugando. No te quedes sin tu número.</p>

            <div className="mt-8">
              <a href="/rifas" className="inline-block px-6 py-3 rounded-md font-semibold text-black" style={{ background: 'var(--aris-gold)', border: '1px solid rgba(0,0,0,0.08)' }}>Comprar boletas ahora</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
