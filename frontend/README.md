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
```

Notes:
- Fast, minimal UI for listing rifas and reserving tickets.
- Uses `axios` to call the existing backend endpoints.
