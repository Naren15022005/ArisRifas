import React from 'react'

export default function Footer(): JSX.Element {
  return (
    <footer className="w-full bg-black/40 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col items-center justify-center gap-1">
        <div className="text-sm text-gray-300">© {new Date().getFullYear()} ArisRifas. Todos los derechos reservados.</div>
        <a href="/admin/login" className="text-sm text-gray-300">admin</a>
      </div>
    </footer>
  )
}
