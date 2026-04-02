import React, { useEffect } from 'react'

type Props = {
  message: string | null
  type?: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type = 'success', onClose }: Props) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => onClose(), 3000)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className={`max-w-sm px-4 py-3 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
        {message}
      </div>
    </div>
  )
}
