# Flujo Frontend — ArisRifas

Resumen
- Objetivo: Interfaz web para listar rifas, ver detalles, reservar boletos, y completar pago mock.
- Stack: Next.js + TypeScript + Tailwind CSS. Cliente HTTP: Axios (`frontend/lib/api.ts`).

Trabajo realizado
- Scaffold completo del proyecto Next.js (`frontend/`).
- Página de listado de rifas implementada (`pages/index.tsx`).
- Página de detalle de rifa con selección de cantidad y flujo de reserva (`pages/raffles/[id].tsx`).
- Integración con el endpoint de reserva: POST `/api/purchases/reserve` (idempotencia via `idempotency-key`).
- Botón de checkout que llama a `POST /api/payments/:id/checkout` y abre la `checkoutUrl` devuelta.
- Cliente API centralizado en `frontend/lib/api.ts` con `NEXT_PUBLIC_API_URL` y generación de idempotency keys.
- Styling base con Tailwind, layout global y manejo básico de estados (loading/message).
- Dev server configurado y funcionando en `http://localhost:3000`.

Pendiente / Por hacer
- UI de checkout / estado de pago y página que reciba notificaciones del webhook (mostrar status de pago).
- Tests: unitarios y E2E (Playwright/Cypress) para reservas y proceso de checkout.
- Mejoras UX: paginación/filtrado en listado, manejo de errores más rico, validaciones de formulario.
- Integración con sistema de autenticación (actualmente `userId` es fijo en llamadas de prueba).
- Soporte offline/progresivo (service worker) y optimizaciones de producción.

Flujo funcional completo (end-to-end)
1. Usuario abre la lista de rifas en `GET /` — el frontend usa `frontend/lib/api.ts` apuntando a `http://localhost:3001`.
2. Usuario hace clic en una rifa → carga `GET /api/raffles/:id` y `GET /api/raffles/:id/tickets` para ver disponibilidad.
3. Usuario elige cantidad y presiona `Reservar` → frontend genera `idempotency-key` y POST `/api/purchases/reserve` con `{ userId, raffleId, quantity }`.
   - Backend ejecuta reserva transaccional, fija `reservedUntil` y crea `Purchase`/`PurchaseItems` guardando la llave de idempotencia.
4. Frontend recibe `purchaseId` y TTL; muestra botón `Ir al checkout`.
5. Usuario pulsa `Ir al checkout` → frontend POST `/api/payments/:purchaseId/checkout` (mock), backend devuelve `checkoutUrl`.
6. Frontend abre `checkoutUrl` (simulado). En producción aquí se redirige al proveedor de pagos.
7. Webhook (mock) entrega evento de pago a `POST /api/webhooks/wompi` → backend valida HMAC, aplica idempotencia y marca la `Payment` y la `Purchase` como pagadas.
8. Frontend puede consultar estado de la `Purchase`/`Payment` y mostrar confirmación al usuario.

Porcentaje de avance (estimación)
- Frontend scaffold y funciones principales: 80%
  - Listado, detalle, reserva, checkout mock: 100%
  - UI de estado post-pago / webhook UX: 0%
  - Tests E2E / unitarios: 0%
  - Auth y producción-hardening: 50% (infraestructura base lista, pero falta integración y seguridad)

Notas operativas rápidas
- Asegúrate de que `frontend/.env.local` contiene `NEXT_PUBLIC_API_URL=http://localhost:3001` en desarrollo.
- Para pruebas de reserva y checkout usar la cuenta de seed (userId 1) o adaptar UI para login.
- Recomendación inmediata: implementar la página de estado del pago (consulta de `Purchase`) y añadir pruebas E2E para la reserva.

Archivos clave
- `frontend/pages/index.tsx` — listado de rifas.
- `frontend/pages/raffles/[id].tsx` — detalle, reservar y checkout.
- `frontend/lib/api.ts` — configuración Axios y generación de idempotency keys.
