import React from 'react'
import SupabaseUploadExample from '../components/SupabaseUploadExample'

export default function SupabaseUploadPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Prueba de Supabase Storage</h1>
      <p>Usa este formulario para probar subidas directas desde el navegador (Vercel).</p>
      <SupabaseUploadExample />
    </main>
  )
}
