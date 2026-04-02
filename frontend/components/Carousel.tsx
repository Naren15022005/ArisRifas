import React, { useEffect, useRef, useState } from 'react'

type Slide = {
  image: string
  title?: string
  subtitle?: string
  price?: number
}

export default function Carousel({ items, slides }: { items?: Slide[]; slides?: React.ReactNode[] }) {
  const sourceLength = slides ? slides.length : (items ? items.length : 0)
  const [index, setIndex] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const slideHeights = useRef<number[]>([])

  useEffect(() => {
    start()
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLength])

  useEffect(() => {
    // when index changes or slide heights update, sync container height
    function sync() {
      const h = slideHeights.current[index] || 0
      if (containerRef.current && h > 0) {
        containerRef.current.style.minHeight = `${h}px`
      }
    }
    // initial sync and on resize
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [index])

  function start() {
    stop()
    if (sourceLength <= 1) return
    intervalRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % sourceLength)
    }, 5000)
  }

  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // manual controls removed (autoplay-only carousel per request)

  return (
    // NOTE: keep bottom margin 0 here so the page controls spacing via the wrapper
    // (pages/rifas.tsx). We removed md/lg margins to avoid double spacing.
    <div ref={containerRef} className="w-full relative group min-h-[240px] sm:min-h-[320px] md:min-h-[420px] lg:min-h-[520px]" onMouseEnter={stop} onMouseLeave={start}>
      {Array.from({ length: sourceLength }).map((_, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          aria-hidden={i !== index}
        >
          {/* Wrap slide content in a measuring wrapper so we can read its height */}
          <div
            ref={(el) => {
              if (el) {
                slideHeights.current[i] = el.offsetHeight
                // if this is the active slide, ensure container minHeight
                if (i === index && containerRef.current) containerRef.current.style.minHeight = `${el.offsetHeight}px`
              }
            }}
            className="w-full h-auto"
          >
            {slides ? (
              slides[i]
            ) : (
              (() => {
                const s = (items || [])[i]
                return (
                  <div className="w-full h-full grid grid-cols-1 md:grid-cols-12">
                    <div className="col-span-1 md:col-span-7 flex items-center p-6 md:p-10">
                      <div>
                        {s.title && <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{s.title}</h3>}
                        {s.subtitle && <p className="mt-2 text-gray-300 max-w-lg">{s.subtitle}</p>}
                        {'price' in s && s.price !== undefined && (
                          <div className="mt-4">
                            <span className="text-aris-gold font-semibold">${(s as any).price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-5 flex items-center justify-center bg-transparent">
                      <img src={s.image} alt={s.title || `slide-${i}`} className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                )
              })()
            )}
          </div>
        </div>
      ))}

      {/* manual navigation controls removed — autoplay only */}
    </div>
  )
}
