import React, { useState } from 'react'
import { uploadFileToSupabase, getPublicUrl } from '../utils/supabaseStorage'

export default function SupabaseUploadExample() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)

  async function handleUpload() {
    if (!file) return setStatus('Selecciona un archivo')
    setStatus('Subiendo...')
    try {
      const key = `images/${Date.now()}-${file.name}`
      const url = await uploadFileToSupabase(file, key)
      setPublicUrl(url)
      setStatus('Subida completada')
    } catch (err: any) {
      setStatus('Error: ' + (err.message || String(err)))
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium">Ejemplo: Subir imagen a Supabase Storage</h3>
      <input
        aria-label="file"
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mt-2"
      />
      <div className="mt-2">
        <button
          onClick={handleUpload}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Subir
        </button>
      </div>
      {status && <div className="mt-2">{status}</div>}
      {publicUrl && (
        <div className="mt-2">
          <div>URL pública:</div>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
            {publicUrl}
          </a>
          <div className="mt-2">
            <img src={publicUrl} alt="uploaded" style={{ maxWidth: 400 }} />
          </div>
        </div>
      )}
    </div>
  )
}
