# Flujo Backend — ArisRifas

Resumen del estado actual, implementaciones y pendientes (marzo 2026).

**Resumen rápido**
- Avance aproximado: **80%**.

**Qué hemos implementado (resumen conciso)**
- Inicialización y corrección de `PrismaClient` para el entorno (adaptador MariaDB, `src/lib/prisma.ts`).
- Esquema Prisma aplicado y seed ejecutado (`prisma/schema.prisma`, `prisma/seed.ts`, `prisma/seed_sql.js`).
- Endpoint transaccional de reserva: `POST /api/purchases/reserve` (SELECT ... FOR UPDATE, `updateMany`, creación de `Purchase`/`PurchaseItem`, persistencia de `IdempotencyKey`).
- Endpoints públicos mínimos: `GET /api/raffles`, `GET /api/raffles/:id`, `GET /api/raffles/:id/tickets`, `GET /api/tickets/:id`.
- Limpieza automática de reservas expiradas: `PurchasesService.cleanupExpiredReservations()`, `POST /api/cron/cleanup`, `SchedulerService` (cron cada 5 minutos).
- Pagos mock y webhook simulado: `POST /api/payments/:id/checkout` (mock payment) y `POST /api/webhooks/wompi` con HMAC + idempotencia + transacción de estado.
- Dockerización y entornos locales: `backend/Dockerfile`, `docker-compose.yml` (MySQL + Redis + app) y `backend/src/redis/*` (RedisModule/RedisService).
- Infra/CI skeletons añadidos: `infra/terraform/*` (esqueleto Terraform) y `.github/workflows/ci.yml` (CI: lint, tests, build+push image).

**Qué falta (pendientes concretos y relevantes)**
- Integrar locking distribuido opcional en `PurchasesService` usando Redis (mejorar defensa bajo concurrencia extrema).
- Tests automatizados críticos: concurrencia/stress, integración end-to-end (Jest + contenedor DB en CI).
- (Producción) Integrar pasarela de pagos real y pruebas de integración en sandbox (actualmente mock).
- Endpoints administrativos / autenticación si se requiere acceso protegido.
- Opcional: automatizar despliegue de la infra (Terraform) desde CI — pendiente por seguridad/credenciales.

**Comandos útiles (rápidos)**
- Regenerar cliente Prisma y correr seed (desde `backend`):

```powershell
npx prisma generate
npx ts-node -r dotenv/config prisma/seed.ts
```

- Ejecutar cleanup manualmente (script de prueba):

```powershell
npx ts-node -r dotenv/config scripts/cleanup-expired.ts
```

**Notas importantes (relevantes para el flujo)**
- La reserva es transaccional y usa SELECT ... FOR UPDATE + `updateMany` para marcar tickets; además hay una restricción única en la tabla `PurchaseItem.ticketId` para garantizar que un ticket solo se asigne una vez.
- Idempotencia de reservas y de webhooks está implementada (tablas `IdempotencyKey` y `AuditLog`).

**Estado / porcentaje**
- Tareas y artefactos clave completados: 8
- Pendientes de prioridad (previstas): 2–3 (locking Redis, tests automatizados, despliegue infra automatizado opcional)
- Avance estimado: **80%**

---
Archivo: [readmes/flujo_backend.md](readmes/flujo_backend.md)

Si quieres, actualizo además `readmes/api_usage.md` con ejemplos `curl` concretos o implemento el `lock` Redis en `PurchasesService` (puedo hacerlo ahora si lo autorizas). 
