# Supabase Edge Functions (quick start)

Estos archivos contienen funciones de ejemplo listas para desplegar en Supabase Edge Functions.

Objetivo: exponer endpoints HTTPS que el frontend (Vercel) pueda llamar sin necesidad de exponer la Service Role Key en el navegador.

Funciones incluidas:
- `raffles` — GET proxy a la tabla `raffles` vía Supabase REST API (usa Service Role Key en el servidor).
- `login` — placeholder para lógica de login/chequeos admin (recomendado usar Supabase Auth desde el frontend).

Pasos para desplegar

1. Instalar CLI de Supabase (si no lo tienes):

```bash
npm install -g supabase
```

2. Inicia sesión y selecciona tu proyecto:

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

3. Desde la raíz del repo, entra a la carpeta de funciones y despliega:

```bash
cd infra/supabase/functions/raffles
supabase functions deploy raffles --project-ref <your-project-ref>

cd ../login
supabase functions deploy login --project-ref <your-project-ref>
```

4. Configura variables de entorno en Supabase (Project → Settings → Environment Variables) para las funciones:
- `SUPABASE_URL` = https://<your-project>.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY` = (tu service role key, secreto)

5. Obtén la URL de la función y configúrala en Vercel como `NEXT_PUBLIC_BACKEND_URL`. Ejemplo:

`https://<your-project>.functions.supabase.co/raffles`

Notas y seguridad
- No pongas `SUPABASE_SERVICE_ROLE_KEY` en variables `NEXT_PUBLIC_*` — manténla sólo en Supabase Function env o en servidor de confianza.
- Para autenticación de usuarios, recomendamos usar Supabase Auth directamente desde el frontend (`supabase.auth.signInWithPassword`) y proteger recursos con RLS y claims, o realizar acciones con privilegios desde funciones server-side.
