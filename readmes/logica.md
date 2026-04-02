# Lógica de negocio — Sistema de venta de boletos de rifas

## **Resumen**
- **Propósito:** Plataforma web para crear y vender boletos de rifas.
- **Stakeholders:** **Admin** (gestiona sorteos) y **Cliente** (compra boletos).
- **Tecnología propuesta:** MySQL + Prisma, Backend con NestJS, Frontend con Next.js.

## **Concepto / Requisitos clave**
- El cliente ve sorteos activos y sus boletos disponibles.
- Al seleccionar un número, ese boleto queda marcado como vendido e inhabilitado para otros clientes (garantizar atomicidad y evitar doble-venta).
- El admin crea sorteos con fecha/hora de cierre; en la UI se muestra un conteo regresivo hasta la fecha del sorteo.
- Registro / login: admin y clientes. Autenticación JWT para APIs; sesión o token en frontend.
- Opcional: integración de pagos (puede ser Pasarela externa), pero la lógica de reserva/venta debe tolerar pagos asincrónicos.

## **Modelado de datos (MySQL + Prisma)**
- Entidades principales: `User`, `Raffle`, `Ticket`, `Purchase`.

Ejemplo de modelos Prisma (resumen):

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(CUSTOMER)
  purchases Purchase[]
}

enum Role { ADMIN CUSTOMER }

model Raffle {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  drawDate    DateTime
  createdAt   DateTime @default(now())
  tickets     Ticket[]
  isPublished Boolean  @default(false)
}

model Ticket {
  id         Int      @id @default(autoincrement())
  raffleId   Int
  number     Int
  status     TicketStatus @default(AVAILABLE)
  purchaser  User?    @relation(fields: [purchaserId], references: [id])
  purchaserId Int?
  createdAt  DateTime @default(now())

  @@unique([raffleId, number])
}

enum TicketStatus { AVAILABLE RESERVED SOLD }

model Purchase {
  id         Int      @id @default(autoincrement())
  userId     Int
  ticketId   Int
  status     PurchaseStatus @default(PENDING)
  createdAt  DateTime @default(now())
}

enum PurchaseStatus { PENDING PAID CANCELLED }
```

Notas de diseño de DB:
- `@@unique([raffleId, number])` garantiza que no haya duplicados de número en el mismo sorteo.
- `Ticket.status` controla estado: `AVAILABLE`, `RESERVED` (temporal durante pago), `SOLD`.
- Reservas temporales pueden expirar (campo extra `reservedAt` si se requiere).

## **Lógica crítica (backend)**
- Atomicidad al comprar un boleto:
  - Usar una transacción en la que se intente cambiar `Ticket.status` de `AVAILABLE` a `SOLD` (o a `RESERVED` y luego `SOLD` tras confirmación de pago).
  - Implementación robusta: `UPDATE Ticket SET status='SOLD' WHERE id=? AND status='AVAILABLE'` y verificar filas afectadas = 1. Si 0, retornar error "boleto no disponible".
  - Con Prisma, usar `prisma.$transaction()` o `updateMany` con condición `status: 'AVAILABLE'` y comprobar el resultado.
- Manejo de alta concurrencia: preferir la estrategia de actualización condicional en la BD (fila afectada) sobre lecturas previas.
- Endpoints REST/GraphQL sugeridos:
  - `POST /api/raffles` (admin) — crear sorteo.
  - `GET /api/raffles` — listar sorteos (incluye `drawDate`, estado, y conteo/porcentaje de vendidos).
  - `GET /api/raffles/:id/tickets` — listar tickets y su estado (ocultar comprador para no exponer datos).
  - `POST /api/raffles/:id/tickets/:ticketId/purchase` — intentar comprar (realiza la actualización atómica y crea `Purchase`).
  - `POST /api/purchases/:id/confirm` — confirmar pago (si hay paso de pago externo).
  - Autenticación: `POST /api/auth/login`, `POST /api/auth/register`.
- Validaciones de negocio:
  - No permitir compras después de `Raffle.drawDate`.
  - Validar que el admin no pueda crear tickets duplicados.
  - Política de reserva expiración si se implementa paso de pago.

## **Lógicas especiales**
- Conteo regresivo:
  - Backend expone `drawDate` (UTC) y `now` opcional para prevenir desajustes de reloj cliente.
  - Frontend calcula el countdown usando `drawDate - serverNow + clientClockOffset`.
- Pre-reservas vs venta inmediata:
  - Venta inmediata: simple `UPDATE ... WHERE status='AVAILABLE'` -> `SOLD`.
  - Con pago: marcar `RESERVED` + `reservedAt` y poner un job/cron para limpiar reservas expiradas tras X minutos.
- Auditoría y logs: registrar cada cambio de estado de `Ticket` y `Purchase` para trazabilidad.

## **Frontend (Next.js)**
- Páginas/Flujos:
  - Home: lista de sorteos publicados con mini-card y conteo de tiempo restante.
  - Raffle detail: vista con grid de boletos (sólo mostrar `AVAILABLE` y `SOLD`; para rendimiento, paginar o agrupar por rangos).
  - Checkout: flujo de compra (selección, confirmación, pago si aplica).
  - Admin dashboard: CRUD de sorteos, creación de tickets (subida masiva posible), ver ventas.
- Consideraciones UI/UX:
  - Bloquear la UI del número seleccionado hasta que la API confirme venta (evitar asunción local).
  - Mostrar indicadores de carga y errores claros.
  - Optimizar renderizado de grid de tickets (virtualized list) si hay muchos boletos.
- Estado y sincronización:
  - Uso de SWR/React Query para fetch y revalidación en background.
  - Push / WebSocket opcional para actualizar en tiempo real el estado de boletos (recomendado para alta concurrencia y experiencia en vivo).

## **DevOps / Infraestructura**
- Requisitos mínimos:
  - Servidor para NestJS (Node 18+), servidor para Next.js (o Vercel para frontend y API en otro host).
  - MySQL gestionado (RDS/Azure Database), backups y réplica si escala.
- CI/CD:
  - Pipeline para tests, lint, build y despliegue.
  - Migraciones: usar Prisma Migrate; correr migraciones en despliegue (con control de versiones).
- Seguridad:
  - HTTPS obligatorio.
  - Variables sensibles en secret store; rotation de claves.
  - Limitar intentos por IP para evitar bots que reserven muchos boletos.
- Escalado:
  - Uso de colas (BullMQ/Redis) para tareas pesadas o expiración de reservas.
  - Cache (Redis) para lecturas frecuentes (listado de sorteos) pero sin cachear estados críticos de disponibilidad de tickets; si se cachea, invalidar rápidamente o usar fuente de verdad en BD.

## **Testing**
- Backend:
  - Unit tests para servicios (ej. lógica de compra con mocks de Prisma).
  - Tests de integración que usen una BD de prueba (docker-compose con MySQL) para validar transacciones atómicas.
  - Tests de concurrencia: pruebas que intenten comprar el mismo ticket desde múltiples hilos/procesos y aseguren que sólo 1 tiene éxito.
- Frontend:
  - Unit tests para componentes críticos.
  - E2E tests (Cypress/Playwright) que simulen compra completa.
- Monitorización / Observabilidad:
  - Métricas de tasa de éxito de compra, latencia de endpoints, errores 5xx.

## **Checklist mínimo para entrega (MVP)**
- [ ] Autenticación (clientes + admin).
- [ ] CRUD de sorteos (admin) y publicación.
- [ ] Visualización de sorteos y grid de tickets (cliente).
- [ ] Compra atómica de un ticket (prevención de doble-venta).
- [ ] Conteo regresivo en UI.
- [ ] Migraciones con Prisma y script de iniciación.
- [ ] Tests de integración para la compra atómica.

## **Siguientes pasos (sugeridos)**
- 1) Confirmas si queremos soporte de `RESERVED` (paso de pago) o venta inmediata `SOLD` al click.
- 2) Si confirmas, diseño detallado de esquema Prisma (archivos .prisma) y migraciones.
- 3) Especificación API (endpoints, payloads) y contratos (OpenAPI) para que frontend y backend empiecen paralelamente.

---

_Comentario:_ este documento recoge la lógica de negocio y las decisiones técnicas iniciales. Puedo ahora generar el esquema Prisma completo, los endpoints en forma de especificación OpenAPI, o comenzar implementando el flujo de compra atómica en NestJS. Indica el siguiente paso que prefieres.

## **Setup e instalación paso a paso (Windows)**

Estos pasos preparan el entorno de desarrollo, la base de datos y los proyectos `backend` y `frontend`.

- Requisitos locales: Node 18+, Git, Docker (para MySQL). Verifica versiones:

```powershell
node -v
npm -v
docker --version
```

- 1) Levantar MySQL con Docker (ejemplo rápido):

```powershell
docker run --name aris-mysql -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=aris -e MYSQL_USER=aris -e MYSQL_PASSWORD=secret -p 3306:3306 -d mysql:8.0
```

Si prefieres `docker-compose`, crea `docker-compose.yml` con un servicio `mysql` y levántalo con `docker compose up -d`.

- 2) Estructura inicial del repo (desde la raíz del proyecto):

```powershell
cd c:\Users\alfon\Documents\Proyectos\ArisRifas
mkdir backend frontend
```

- 3) Inicializar y configurar el backend (NestJS + Prisma):

```powershell
# crear el scaffold de NestJS (usa npx para no instalar globalmente)
npx @nestjs/cli new backend --package-manager npm

cd backend

# instalar Prisma y cliente
npm install prisma @prisma/client --save-dev

# dependencias comunes para auth y utilidades
npm install @nestjs/passport passport passport-jwt @nestjs/jwt bcryptjs dotenv

# inicializar Prisma (elige mysql)
npx prisma init --datasource-provider mysql
```

Editar `backend/.env` y poner la conexión a MySQL:

```
DATABASE_URL="mysql://aris:secret@localhost:3306/aris"
```

Luego generar el esquema y migrar (después de crear `schema.prisma` con los modelos):

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

- 4) Inicializar frontend (Next.js con TypeScript recomendado):

```powershell
cd ..\frontend
npx create-next-app@latest . --typescript

# instalar utilidades de cliente
npm install axios swr
```

- 5) Scripts de desarrollo (ejemplo):

En `backend`:
```json
"scripts": {
  "start:dev": "nest start --watch",
  "prisma:migrate": "prisma migrate dev",
  "prisma:generate": "prisma generate",
  "test": "jest"
}
```

En `frontend` (Next ya define `dev`):
```powershell
npm run dev
```

- 6) Comprobación rápida:

```powershell
# backend
cd backend
npm run start:dev

# en otra terminal: frontend
cd ..\frontend
npm run dev
```

- 7) Archivos útiles a crear/añadir ahora:
  - `backend/.env.example` con `DATABASE_URL` y `JWT_SECRET`.
  - `backend/prisma/schema.prisma` con los modelos (ver sección "Modelado de datos").
  - `frontend/.env.local` para variables públicas (p.ej. `NEXT_PUBLIC_API_URL`).

- 8) Tests y migraciones en CI:

Configurar un job que:
  1. Instale Node y Docker
  2. Levante MySQL (servicio o docker-compose)
  3. Ejecute `npm ci`, `npx prisma migrate deploy` y tests.

---

Si quieres, puedo generar aquí el `docker-compose.yml`, un `backend/.env.example`, y el `prisma/schema.prisma` inicial con los modelos que propusimos. ¿Cuál prefieres que haga ahora?

## **Estado actual y qué funciona ahora**

- `logica.md` creado: contiene la lógica de negocio completa, modelos Prisma propuestos, endpoints y el flujo de pago con Wompi.
- Se añadió la sección **Setup e instalación (Windows)** en este mismo archivo con comandos para levantar MySQL (Docker), inicializar Next.js y Prisma.
- Lista de tareas inicial (`todo list`) creada y actualizada para guiar el desarrollo.

Qué podemos usar ya para empezar a trabajar:

- Levantar MySQL en Docker:

```powershell
docker run --name rifas-mysql -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=rifas -e MYSQL_USER=rifas -e MYSQL_PASSWORD=secret -p 3306:3306 -d mysql:8.0
```

- Instrucciones rápidas para crear el proyecto Next.js (si aún no está creado):

```powershell
npx create-next-app@latest rifas --typescript --eslint --tailwind --app
cd rifas
```

- Inicializar Prisma después de copiar el `schema.prisma` (ver la sección "Modelado de datos"):

```powershell
npm install prisma @prisma/client
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

Archivos importantes que ya están en el repo o que generaremos:

- `logica.md` — lógica y decisiones (este documento).
- `prisma/schema.prisma` — (pendiente) copiar desde la sección "Modelado de datos" y migrar.
- `.env.example` — (pendiente) variables mínimas (`DATABASE_URL`, `NEXTAUTH_SECRET`, `WOMPI_*`).

Siguientes pasos recomendados (prioridad alta):

1. Crear `docker-compose.yml` y levantar MySQL (si prefieres docker-compose).
2. Scaffold del proyecto Next.js y copiar `schema.prisma` desde aquí.
3. Implementar endpoint `POST /api/purchases/reserve` (reserva atómica) y testear concurrencia.
4. Configurar Wompi en modo sandbox y el webhook de verificación HMAC.

Si quieres, implemento ahora cualquiera de estos pasos automáticamente: generar `docker-compose.yml`, crear `prisma/schema.prisma` con el modelo v2, o escribir el Route Handler `POST /api/purchases/reserve` con un test de concurrencia.

---

Abre este archivo para más detalles técnicos y comandos avanzados.