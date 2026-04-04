const LOCAL_BACKEND_URL = 'http://localhost:3001'

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, '')
}

function pickFirstUrl(values: Array<string | undefined>) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return trimTrailingSlash(value.trim())
    }
  }

  return null
}

export function getBackendBaseUrl() {
  const resolved = pickFirstUrl([
    process.env.BACKEND_URL,
    process.env.API_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ])

  if (resolved) return resolved
  if (process.env.NODE_ENV !== 'production') return LOCAL_BACKEND_URL

  throw new Error(
    'Missing backend URL env. Set BACKEND_URL, API_URL, NEXT_PUBLIC_BACKEND_URL, or NEXT_PUBLIC_API_URL.',
  )
}

export function normalizeBackendAssetUrl(path?: string) {
  if (!path) return '/images/placeholder.svg'
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  // If Supabase public storage is configured and the path points to uploads,
  // return the Supabase public storage URL so the frontend fetches directly from storage.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const uploadBucket = process.env.NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET
  if (supabaseUrl && uploadBucket && (path.startsWith('/uploads') || path.startsWith('uploads'))) {
    const base = supabaseUrl.replace(/\/+$/, '')
    const key = path.replace(/^\/+/, '')
    return `${base}/storage/v1/object/public/${uploadBucket}/${key}`
  }

  const baseUrl = getBackendBaseUrl()
  if (path.startsWith('/')) return `${baseUrl}${path}`
  return `${baseUrl}/${path}`
}