import React from 'react'
import Reveal from './Reveal'

export default function HeroPromo(){
  return (
    <section className="relative mt-8 md:mt-8 lg:mt-16 pt-20 md:pt-20 lg:pt-28 pb-8 mb-24 md:mb-16 lg:mb-20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <Reveal className="lg:col-span-7">
          <div className="lg:col-span-7">
            <div className="mb-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-aris-gold/30 bg-black/20">
                <span className="w-2 h-2 rounded-full bg-aris-gold inline-block" />
                <span className="text-sm uppercase tracking-wider text-aris-gold font-medium">Plataforma verificada y segura</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-extrabold text-white leading-tight max-w-full">
              Tu <span className="text-aris-gold inline-block">premio</span> puede estar disponible ahora mismo
              <span className="block mt-1 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-400">Alguien va a ganar. ¿Por qué no tú?</span>
            </h1>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <a href="/rifas" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-aris-gold text-black rounded-md shadow transition duration-200 ease-out hover:shadow-lg hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-aris-gold/30">Ver rifas activas</a>
            </div>
          </div>
          </Reveal>

          <Reveal className="lg:col-span-5">
          <div className="lg:col-span-5 flex items-center justify-center hidden sm:flex">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-full">
              <div className="rounded-xl overflow-hidden bg-gradient-to-br from-black/20 to-transparent border border-gray-700 h-48 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center">
                <img src="/images/hero-illustration.svg" alt="Illustration" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
