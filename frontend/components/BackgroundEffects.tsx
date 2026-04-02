import React from 'react'

type Particle = { x: number; y: number; s: number; d: number; dur: number; gold?: boolean }

const PARTICLES: Particle[] = [
  // top strip
  { x: 4,  y: 2,  s: 1.5, d: 0.0, dur: 3.5 },
  { x: 14, y: 6,  s: 1.0, d: 1.2, dur: 4.2 },
  { x: 27, y: 1,  s: 2.0, d: 0.5, dur: 2.8 },
  { x: 41, y: 5,  s: 1.0, d: 2.1, dur: 5.1 },
  { x: 54, y: 8,  s: 1.5, d: 0.3, dur: 3.7 },
  { x: 67, y: 3,  s: 1.0, d: 1.8, dur: 4.5 },
  { x: 77, y: 6,  s: 2.0, d: 0.9, dur: 3.2 },
  { x: 87, y: 2,  s: 1.0, d: 2.5, dur: 4.8, gold: true },
  { x: 94, y: 9,  s: 1.5, d: 0.7, dur: 3.9, gold: true },
  // upper-mid
  { x: 7,  y: 18, s: 1.0, d: 1.5, dur: 4.1 },
  { x: 21, y: 14, s: 2.0, d: 0.2, dur: 3.3 },
  { x: 37, y: 22, s: 1.0, d: 3.0, dur: 5.5 },
  { x: 51, y: 16, s: 1.5, d: 1.7, dur: 3.8 },
  { x: 64, y: 20, s: 1.0, d: 0.6, dur: 4.3 },
  { x: 74, y: 13, s: 2.0, d: 2.2, dur: 3.6, gold: true },
  { x: 84, y: 24, s: 1.0, d: 1.0, dur: 4.7, gold: true },
  { x: 91, y: 17, s: 1.5, d: 3.3, dur: 5.0 },
  // center
  { x: 9,  y: 38, s: 1.0, d: 0.4, dur: 4.4 },
  { x: 29, y: 43, s: 1.5, d: 2.8, dur: 3.1 },
  { x: 47, y: 36, s: 1.0, d: 1.3, dur: 5.2 },
  { x: 59, y: 41, s: 2.0, d: 0.8, dur: 3.4 },
  { x: 71, y: 34, s: 1.0, d: 2.0, dur: 4.6 },
  { x: 81, y: 42, s: 1.5, d: 1.6, dur: 3.0, gold: true },
  { x: 90, y: 37, s: 1.0, d: 3.5, dur: 4.2 },
  // lower-mid
  { x: 17, y: 58, s: 2.0, d: 0.1, dur: 3.7 },
  { x: 34, y: 63, s: 1.0, d: 2.4, dur: 4.9 },
  { x: 49, y: 56, s: 1.5, d: 1.1, dur: 3.5 },
  { x: 62, y: 61, s: 1.0, d: 0.6, dur: 5.3 },
  { x: 77, y: 54, s: 2.0, d: 1.9, dur: 3.8 },
  { x: 87, y: 66, s: 1.0, d: 2.7, dur: 4.1 },
  // bottom strip
  { x: 11, y: 76, s: 1.0, d: 0.3, dur: 3.2 },
  { x: 26, y: 83, s: 1.5, d: 1.4, dur: 4.5 },
  { x: 44, y: 73, s: 1.0, d: 2.9, dur: 3.6 },
  { x: 57, y: 86, s: 2.0, d: 0.7, dur: 5.1 },
  { x: 69, y: 78, s: 1.0, d: 1.8, dur: 3.9 },
  { x: 79, y: 91, s: 1.5, d: 2.3, dur: 4.3 },
  { x: 92, y: 80, s: 1.0, d: 0.5, dur: 4.8 },
]

export default function BackgroundEffects() {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">

      {/* ── Diffuse lights ── */}
      {/* Red glow — bottom-left */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: '-120px', left: '-100px',
          width: '700px', height: '700px',
          background: 'radial-gradient(circle, rgba(185,28,28,0.22) 0%, rgba(185,28,28,0.06) 40%, transparent 70%)',
          filter: 'blur(90px)',
        }}
      />
      {/* Gold glow — top-right */}
      <div
        className="absolute rounded-full"
        style={{
          top: '-80px', right: '-80px',
          width: '560px', height: '560px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.04) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      {/* Secondary red accent — center right edge */}
      <div
        className="absolute rounded-full"
        style={{
          top: '35%', right: '-60px',
          width: '360px', height: '360px',
          background: 'radial-gradient(circle, rgba(185,28,28,0.10) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      {/* Subtle gold accent — center left */}
      <div
        className="absolute rounded-full"
        style={{
          top: '45%', left: '-40px',
          width: '260px', height: '260px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── Grain ── */}
      <div className="absolute inset-0 grain-overlay" />

      {/* ── Sparkles ── */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className={`absolute rounded-full sparkle-dot${p.gold ? ' sparkle-gold' : ''}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.s}px`,
            height: `${p.s}px`,
            animationDelay: `${p.d}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  )
}
