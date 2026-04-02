import React from 'react'
import Reveal from './Reveal'

export default function HowItWorks() {
  return (
    <section id="como-participar" className="relative w-full px-4 lg:px-8 py-16 bg-transparent">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-white">COMO PARTICIPAR</h2>
        </div>

        <div className="relative">
          {/* connecting line for md+ screens */}
          <div
            className="hidden md:block absolute"
            style={{
              top: '3.5rem',
              left: '16.6667%',
              right: '16.6667%',
              height: '6px',
              borderRadius: '3px',
              background: 'linear-gradient(90deg, rgba(212,175,55,0.98), rgba(212,175,55,0.75))',
            }}
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal>
              <div className="p-6 text-center flex flex-col items-center gap-4 transform transition duration-300">
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-aris-gold to-yellow-400 flex items-center justify-center text-aris-black text-xl font-bold shadow-md how-badge">1</div>
                <h3 className="text-lg font-semibold text-white">Elige tu rifa</h3>
                <p className="mt-1 text-gray-300 text-sm max-w-xs">Explora las rifas activas y encuentra el premio que quieres ganar</p>
              </div>
            </Reveal>

            <Reveal>
              <div className="p-6 text-center flex flex-col items-center gap-4 transform transition duration-300">
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-aris-gold to-yellow-400 flex items-center justify-center text-aris-black text-xl font-bold shadow-md how-badge">2</div>
                <h3 className="text-lg font-semibold text-white">Escoge tu número</h3>
                <p className="mt-1 text-gray-300 text-sm max-w-xs">Selecciona el número que más te llame y completa tu pago en segundos</p>
              </div>
            </Reveal>

            <Reveal>
              <div className="p-6 text-center flex flex-col items-center gap-4 transform transition duration-300">
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-aris-gold to-yellow-400 flex items-center justify-center text-aris-black text-xl font-bold shadow-md how-badge">3</div>
                <h3 className="text-lg font-semibold text-white">Espera el sorteo</h3>
                <p className="mt-1 text-gray-300 text-sm max-w-xs">Seguimos el sorteo en vivo. Si ganas, te contactamos y te entregamos el premio</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
