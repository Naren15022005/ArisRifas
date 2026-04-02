import React from 'react'
import BackgroundEffects from '../../components/BackgroundEffects'
import Nav from '../../components/Nav'
import WhatsAppFab from '../../components/WhatsAppFab'
import HeroPromo from '../../components/HeroPromo'
import HowItWorks from '../../components/HowItWorks'
import PromoBanner from '../../components/PromoBanner'
import Footer from '../../components/Footer'

export default function ClientHome() {
  return (
    <div className="min-h-screen bg-home-composed relative overflow-hidden">
      <BackgroundEffects />
      <div className="relative z-20 w-full">
        <Nav />
      </div>
        <HeroPromo />
        {/* carousel removed from client home per admin-focus workflow */}
        <HowItWorks />
           <PromoBanner />
           <WhatsAppFab />
        <Footer />
    </div>
  )
}
