# Integración mínima con Supabase (Frontend)

Objetivo: permitir que la web en Vercel haga peticiones directas a Supabase (Storage, Auth) sin tocar el backend.

Pasos rápidos:

- Instalar dependencia en `frontend`:

```bash
cd frontend
npm install @supabase/supabase-js
```

- Variables de entorno (Vercel): configura **Project → Settings → Environment Variables** con:
  - `NEXT_PUBLIC_SUPABASE_URL` = tu `https://<proyecto>.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu `anon` public key (NO uses el service role key en frontend)
  - Opcional: `NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET` (por defecto `uploads`)

- Archivos añadidos:
  - `frontend/lib/supabaseClient.ts` — cliente Supabase reutilizable.
  - `frontend/utils/supabaseStorage.ts` — helpers `uploadFileToSupabase` y `getPublicUrl`.

Uso rápido (ejemplo React):

```tsx
import { useState } from 'react'
import { uploadFileToSupabase, getPublicUrl } from '../utils/supabaseStorage'

function UploadExample() {
  const [file, setFile] = useState<File | null>(null)

  async function handleUpload() {
    if (!file) return
    const key = `images/${Date.now()}-${file.name}`
    const publicUrl = await uploadFileToSupabase(file, key)
    console.log('Public URL:', publicUrl)
  }

  return (
    <div>
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  )
}
```

Notas de seguridad:
- Usa la `anon` key en el cliente; para operaciones con privilegios usa funciones server-side o Edge Functions.
- No pongas `SERVICE_ROLE_KEY` en variables `NEXT_PUBLIC_...`.
