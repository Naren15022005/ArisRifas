# ArisRifas — Flujo Final del Sistema

> Documento de referencia actualizado al estado real del proyecto. Describe arquitectura, rutas, componentes, flujos de datos y credenciales.

---

## 1. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (pages router) · React · TypeScript · Tailwind CSS |
| Backend | NestJS · TypeScript · Prisma ORM · MySQL/MariaDB |
| Autenticación | JWT (NestJS `@nestjs/jwt`) · NextAuth.js (sesión de cliente) · bcryptjs |
| Real-time | Socket.IO — namespace `/raffles` |
| Cache/Locks | Redis (ioredis) |
| Contenedor DB | Docker Compose (MariaDB en puerto 3307) |
| Pagos | Wompi (webhook en `/api/webhooks/wompi`) |

---

## 2. Estructura de carpetas

```
ArisRifas/
├── frontend/          # Next.js app (puerto 3000)
├── backend/           # NestJS API (puerto 3001)
├── readmes/           # Documentación del proyecto
├── infra/             # Terraform (infra opcional)
└── docker-compose.yml # MariaDB + Adminer
```

---

## 3. Base de datos (Prisma schema)

Modelos activos en `backend/prisma/schema.prisma`:

| Modelo | Descripción |
|--------|-------------|
| `User` | Clientes y admins. Campo `role`: `ADMIN` / `CUSTOMER` |
| `Raffle` | Rifas con precio, tickets totales, fecha de sorteo, imagen |
| `Ticket` | Boleto unitario. Estado: `AVAILABLE` / `RESERVED` / `SOLD` |
| `Purchase` | Compra de uno o más tickets por un usuario |
| `PurchaseItem` | Relación N:N entre `Purchase` y `Ticket` |
| `Payment` | Pago Wompi asociado a una compra |
| `IdempotencyKey` | Evita compras duplicadas por red |
| `AuditLog` | Registro de acciones relevantes |

Conexión configurada en `backend/.env`:
```env
DATABASE_URL=mysql://naren:1063616908@127.0.0.1:3307/arisrifas
```

---

## 4. Backend — API REST

Base URL: `http://localhost:3001`

### Autenticación pública (clientes)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login de cliente; devuelve `{ access_token }` |
| POST | `/api/auth/register` | Registro de cliente |

### Autenticación admin
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/admin/login` | Login de admin; devuelve `{ access_token }` |
| POST | `/api/admin/register` | Registro del primer admin (bloqueado si ya existe uno) |

### Rifas
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/raffles` | No | Lista rifas publicadas |
| GET | `/api/raffles/:id` | No | Detalle de rifa |
| GET | `/api/raffles/admin/all` | Admin JWT | Todas las rifas (incluyendo borradores) |
| POST | `/api/raffles` | Admin JWT | Crear rifa |
| PATCH | `/api/raffles/:id` | Admin JWT | Editar rifa |
| DELETE | `/api/raffles/:id` | Admin JWT | Eliminar rifa |
| POST | `/api/raffles/:id/publish` | Admin JWT | Publicar rifa |
| POST | `/api/raffles/:id/unpublish` | Admin JWT | Despublicar rifa |

### Tickets
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/tickets/raffle/:raffleId` | No | Tickets de una rifa |
| POST | `/api/tickets/batch` | Admin JWT | Crear tickets en lote |
| POST | `/api/tickets/reserve` | JWT | Reservar ticket (15 min, con lock Redis) |

### Compras
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/purchases` | JWT | Crear compra |
| GET | `/api/purchases/my` | JWT | Mis compras |

### Pagos y webhooks
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/payments/:purchaseId` | JWT | Estado de pago |
| POST | `/api/webhooks/wompi` | No (firma) | Recibe eventos Wompi |

### Cron manual
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/cron/cleanup` | Libera reservas expiradas (también corre automáticamente) |

---

## 5. Frontend — Páginas

Base URL: `http://localhost:3000`

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `pages/index.tsx` → `pages/client/home.tsx` | Página principal pública |
| `/rifas` | `pages/rifas.tsx` | Listado de todas las rifas publicadas |
| `/raffles/[id]` | `pages/raffles/[id].tsx` | Detalle de rifa individual |
| `/admin/login` | `pages/admin/login.tsx` | Login del admin (con ojito y toast) |
| `/admin/register` | `pages/admin/register.tsx` | Registro del primer admin |
| `/admin` | `pages/admin/index.tsx` | Dashboard de admin (requiere `admin_token`) |
| `/admin/create` | `pages/admin/create.tsx` | Crear nueva rifa |

### Proxies API (Next.js)
| Ruta | Archivo | Proxea a |
|------|---------|---------|
| `POST /api/admin/login` | `pages/api/admin/login.ts` | `backend/api/admin/login` |
| `POST /api/admin/register` | `pages/api/admin/register.ts` | `backend/api/admin/register` |
| `/api/auth/[...nextauth]` | `pages/api/auth/[...nextauth].ts` | Sesión NextAuth (login de cliente) |

---

## 6. Frontend — Componentes activos

| Componente | Descripción |
|-----------|-------------|
| `Nav.tsx` | Barra de navegación (desktop + mobile). Con carrito. Sin sidebar móvil. |
| `HeroPromo.tsx` | Hero principal; CTA apunta a `/rifas` |
| `HowItWorks.tsx` | Sección "Cómo participar" (visible en home, no como botón de nav) |
| `PromoBanner.tsx` | Banner promocional con CTA "Comprar boletas ahora" → `/rifas` |
| `RaffleCard.tsx` | Tarjeta de rifa (horizontal y vertical). Exportado con `React.memo`. |
| `RaffleGrid.tsx` | Grid de rifas con paginación y modal de compra |
| `PurchaseModal.tsx` | Modal de reserva de tickets con countdown de 15 min |
| `CheckoutModal.tsx` | Modal de checkout global; abre WhatsApp al admin |
| `AdminLayout.tsx` | Layout del panel admin (sidebar, topbar, logout) |
| `AdminRaffleModal.tsx` | Modal de edición/detalle de rifa (admin) |
| `AdminRaffleTicketsModal.tsx` | Modal de gestión de talonario de tickets (admin) |
| `Toast.tsx` | Notificación flotante top-right (success/error, auto-dismiss) |
| `Footer.tsx` | Footer con link discreto `/admin/login` bajo copyright |
| `BackgroundEffects.tsx` | Efectos visuales de fondo (gradientes, ruido) |
| `Reveal.tsx` | Animación de entrada (IntersectionObserver) |
| `WhatsAppFab.tsx` | Botón flotante de WhatsApp |
| `Carousel.tsx` | Carrusel autoplay (usado internamente por `Winners.tsx` — eliminado del uso en páginas) |

---

## 7. Hooks y contextos

| Archivo | Descripción |
|---------|-------------|
| `hooks/useNow.ts` | Tick de tiempo compartido (evita múltiples `setInterval`) |
| `hooks/useRafflesSocket.ts` | Conexión Socket.IO al namespace `/raffles`; escucha `purchase:reserved` y `raffle:updated` |
| `contexts/CartContext.tsx` | Estado global del carrito; expone `addToCart`, `removeFromCart`, `checkoutOpen`, etc. |

---

## 8. Flujo de compra (cliente)

```
1. Usuario abre /rifas
2. Hace clic en "Comprar" en un RaffleCard
3. RaffleGrid abre PurchaseModal con la rifa seleccionada
4. PurchaseModal llama POST /api/tickets/reserve
   → Backend adquiere lock Redis
   → Marca ticket como RESERVED + reservedUntil = now + 15min
5. SchedulerService corre cada 1 min; libera tickets expirados
6. Si el usuario completa el pago → PurchaseItem.status = SOLD
7. Socket.IO emite raffle:updated → RaffleCard/RaffleGrid actualiza en tiempo real
```

---

## 9. Flujo de admin

```
1. Admin accede a /admin/login
   → Ingresa email + contraseña (campo con toggle ojo)
   → POST /api/admin/login → backend valida bcrypt + role=ADMIN
   → Devuelve JWT; se guarda en localStorage como 'admin_token'
   → Toast verde "Inicio de sesión exitoso"
2. Dashboard /admin
   → GET /api/raffles/admin/all (con header Authorization)
   → Lista todas las rifas (publicadas y borradores)
3. Editar rifa → AdminRaffleModal
   → PATCH /api/raffles/:id
4. Crear rifa → /admin/create
   → POST /api/raffles
5. Gestión de talonario → AdminRaffleTicketsModal
   → POST /api/tickets/batch
6. Publicar/despublicar → botón en AdminRaffleModal
```

---

## 10. WebSockets (Socket.IO)

- Namespace: `/raffles`
- Eventos emitidos por el backend:
  - `purchase:reserved` → cuando un ticket es reservado
  - `raffle:updated` → cuando una rifa cambia estado
- El hook `useRafflesSocket` se suscribe en el frontend y actualiza el estado de las rifas sin polling.

---

## 11. Scheduler (cron)

`SchedulerService` (NestJS `@nestjs/schedule`) corre cada minuto:
- Libera tickets con `reservedUntil < now` y status `RESERVED`
- Cancela compras `PENDING` asociadas a esos tickets

---

## 12. Variables de entorno

### Backend (`backend/.env`)
```env
PORT=3001
DATABASE_URL=mysql://naren:1063616908@127.0.0.1:3307/arisrifas
REDIS_HOST=127.0.0.1
REDIS_PORT=6380
FRONTEND_ORIGINS=http://localhost:3000
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

---

## 13. Credenciales de admin (desarrollo)

| Campo | Valor |
|-------|-------|
| Email / usuario | `andresserpa2002` |
| Contraseña | `andres2002serpax10` |
| Role en BD | `ADMIN` |

---

## 14. Arranque local

```bash
# 1. Levantar base de datos
docker-compose up -d

# 2. Backend
cd backend
npm install
npm run start:dev   # puerto 3001

# 3. Frontend
cd frontend
npm install
npm run dev         # puerto 3000
```

Adminer (GUI de BD) disponible en: `http://localhost:8080`
- Servidor: `db` · Usuario: `naren` · Contraseña: `1063616908` · Base: `arisrifas`

---

## 15. Archivos y scripts de mantenimiento activos

| Archivo | Propósito |
|---------|-----------|
| `backend/scripts/init-db.ts` | Seed inicial de la BD (primera vez) |
| `backend/scripts/queryRaffles.ts` | Consulta rápida de rifas en consola |
| `backend/prisma/seed.ts` | Seed de Prisma (`npm run seed`) |
| `backend/prisma/seed_sql.js` | Seed alternativo vía SQL (`npm run seed:sql`) |
