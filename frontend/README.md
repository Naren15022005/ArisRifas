Frontend (Next.js + TypeScript + Tailwind)

Run locally:

1. From the `frontend` folder install deps:

```bash
cd frontend
npm install
```

2. Start dev server (defaults to port 3000):

```bash
npm run dev
```

3. Configure API endpoint via environment variable (optional):

Create `.env.local` with:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

Production on Vercel:

Set these environment variables in the Vercel project settings:

```
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://your-render-backend.onrender.com
BACKEND_URL=https://your-render-backend.onrender.com
NEXTAUTH_URL=https://your-vercel-frontend.vercel.app
NEXTAUTH_SECRET=replace-with-a-long-random-secret
```

Notes:
- `BACKEND_URL` is used by Next.js API routes running on the server.
- `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_BACKEND_URL` are used by browser code.
- If `NEXTAUTH_SECRET` is missing in production, `/api/auth/session` can fail with HTTP 500.

Notes:
- Fast, minimal UI for listing rifas and reserving tickets.
- Uses `axios` to call the existing backend endpoints.
