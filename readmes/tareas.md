# Tareas — ArisRifas

Este documento desglosa en tareas accionables todo lo que figura en `logica.md` y añade elementos detectados como necesarios para comenzar el desarrollo.

**Resumen rápido de añadidos**
- Añadidos: idempotencia de endpoints, verificación HMAC y replay protection para webhooks, seed script, generación y control de números de boletos, índices DB sugeridos, estrategia de limpieza de reservas expiradas, pruebas de concurrencia, y documentación `.env.example`.

---

## Backend (Prioridad: alta)
1. Crear `prisma/schema.prisma` con modelos finales (usar modelo v2 en `logica.md`).
2. Añadir índices y constraints sugeridos (`@@unique([raffleId, number])`, `@@index([raffleId, status])`).
3. Implementar `lib/prisma.ts` (singleton).
4. Implementar endpoint `POST /api/purchases/reserve` (Route Handler):
   - Transacción que `updateMany` con condición `status = AVAILABLE`.
   - Devolver `purchaseId` y TTL de reserva.
   - Usar idempotency-key opcional para evitar doble-submit.
5. Implementar `POST /api/purchases/:id/checkout` que cree `Payment` y devuelva URL de Wompi.
6. Implementar webhook `POST /api/webhooks/wompi`:
   - Verificar HMAC (`WOMPI_EVENTS_SECRET`).
   - Protección contra replay (store last events or use payment unique reference).
   - Actualizar Payment / Purchase / Tickets en transacción.
7. Implementar job/Route `GET /api/cron/cleanup` para liberar reservas expiradas.
8. Crear `seed.ts` para crear un raffle y N boletos (script de prueba).
9. Agregar logging/auditoría de cambios de estado (tabla o logs estructurados).
10. Crear pruebas unitarias y de integración (mock de Prisma y BD de integración).

## Frontend (Prioridad: alta)
1. Scaffold Next.js (App Router) y estructura `app/` según `logica.md`.
2. Implementar `ticket-grid` component con virtualización/paginación.
3. Integrar flow de reserva + checkout:
   - Llamar `POST /api/purchases/reserve` al seleccionar boletos.
   - Redirección al link de Wompi tras `checkout`.
4. Implementar bloqueo optimista UI y manejo de errores de reserva.
5. Implementar NextAuth (credenciales) y middleware para rutas admin.
6. Añadir indicadores de tiempo restante (countdown) usando `serverNow`.
7. Tests E2E (Playwright/Cypress) del flujo de compra.

## DevOps / Infraestructura
1. Crear `docker-compose.yml` con servicios: `mysql`, opcional `adminer`, `redis` (si se usa).
2. Crear `.env.example` (documentar variables): `DATABASE_URL`, `NEXTAUTH_SECRET`, `WOMPI_*`, `NEXTAUTH_URL`.
3. Configurar CI (GitHub Actions): instalar Node, levantar MySQL, `npx prisma migrate deploy`, `npm ci`, correr tests.
4. Crear script de despliegue y migraciones (prisma migrate deploy).
5. Documentar cómo probar webhooks localmente (ngrok + `WOMPI_EVENTS_SECRET`).

## Testing (Prioridad: high)
1. Tests unitarios backend (jest) para lógica de reserva y cambios de estado.
2. Test de integración con MySQL en Docker (docker-compose test service).
3. Prueba de concurrencia: script que lanza N procesos intentando reservar el mismo ticket; asegurar que solo 1 succeed.
4. E2E frontend que valide compra exitosa y webhook aprobado.

## Seguridad / Operaciones (Prioridad: high)
1. Implementar verificación HMAC e invalidar webhooks sin firma válida.
2. Rate-limiting en endpoint de reserva (p.ej. 10 req/min por IP).
3. Políticas de CORS y protección CSRF donde aplique.
4. Guardar secretos en secret store y documentar rotación.
5. Backup / restore plan para MySQL (mecanismo y frecuencia).
6. Revisión de GDPR/privacidad si se almacenan datos personales.

## Rendimiento / Escalado (Prioridad: medium)
1. Revisar índices y añadir particionado/paginación si hay sorteos muy grandes.
2. Considerar cola para procesamiento de webhooks y tareas pesadas (BullMQ + Redis).
3. Caching: cachear listados pero no estados de tickets; invalidaciones rápidas.

## Documentación / Contratos API (Prioridad: medium)
1. Definir payloads mínimos OpenAPI para: `reserve`, `checkout`, webhook.
2. Añadir ejemplos de peticiones/respuestas en `logica.md` o `docs/api.md`.
3. `.env.example` y `README.md` de comandos de arranque.

## Tareas auxiliares / Scripts (Prioridad: low)
1. Script para crear boletos en lote (CSV import).
2. Script para limpiar DB de pruebas.
3. `prisma/seed.ts` y comandos `npm run seed`.

---

## Prioridad inmediata (primer sprint)
1. `docker-compose.yml` + `.env.example` + levantar MySQL.
2. `prisma/schema.prisma` + `npx prisma migrate dev --name init` + `prisma generate`.
3. Scaffold Next.js y `lib/prisma.ts`.
4. Implementar `POST /api/purchases/reserve` y su test de concurrencia.
5. Crear `seed.ts` con un raffle de prueba.

---

Si aprobás este desglose, lo añado al `todo list` (marcaré las tareas de sprint como en-progress y empezaré por crear `docker-compose.yml`, `prisma/schema.prisma` y `seed.ts`).
