import React, { useEffect, useRef } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function Reveal({ children, className = '' }: Props){
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible')
        }
      })
    }, { threshold: 0.12 })

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal opacity-0 translate-y-6 transition-transform duration-700 ease-out will-change-transform ${className}`}>
      {children}
    </div>
  )
}
