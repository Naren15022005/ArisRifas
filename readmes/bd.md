# Base de Datos — Diseño y Esquema

Este documento define la base de datos MySQL para ArisRifas. Está organizado por tablas, campos, tipos y relaciones siguiendo la lógica descrita en `logica.md`.

## Resumen
- Motor: MySQL 8 (InnoDB)
- ORM: Prisma
- Reglas clave: transacciones atómicas para reservas/ventas, índices para consultas por sorteo/estado, unicidad de número por sorteo.

---

## Tablas y esquemas (MySQL)

### `users`
- id: INT AUTO_INCREMENT PRIMARY KEY
- email: VARCHAR(255) NOT NULL UNIQUE
- name: VARCHAR(255) NOT NULL
- phone: VARCHAR(30) NULL
- role: ENUM('ADMIN','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER'
- password: VARCHAR(255) NOT NULL -- bcrypt hash
- created_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

Índices/constraints:
- UNIQUE(email)

### `raffles`
- id: INT AUTO_INCREMENT PRIMARY KEY
- title: VARCHAR(255) NOT NULL
- description: TEXT NULL
- image_url: VARCHAR(1024) NULL
- price_per_ticket: DECIMAL(10,2) NOT NULL
- total_tickets: INT NOT NULL
- draw_date: DATETIME NOT NULL
- is_published: TINYINT(1) NOT NULL DEFAULT 0
- created_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

Índices/constraints:
- INDEX(draw_date)

### `tickets`
- id: INT AUTO_INCREMENT PRIMARY KEY
- raffle_id: INT NOT NULL
- number: INT NOT NULL
- status: ENUM('AVAILABLE','RESERVED','SOLD') NOT NULL DEFAULT 'AVAILABLE'
- reserved_until: DATETIME NULL
- created_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

Índices/constraints:
- UNIQUE(raffle_id, number) -- evita duplicados de número por sorteo
- INDEX(raffle_id, status) -- optimiza consultas de disponibilidad por sorteo
- FOREIGN KEY (raffle_id) REFERENCES raffles(id) ON DELETE CASCADE

### `purchases`
- id: INT AUTO_INCREMENT PRIMARY KEY
- user_id: INT NOT NULL
- raffle_id: INT NOT NULL
- total: DECIMAL(10,2) NOT NULL
- status: ENUM('PENDING','PAID','CANCELLED') NOT NULL DEFAULT 'PENDING'
- created_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Índices/constraints:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
- FOREIGN KEY (raffle_id) REFERENCES raffles(id) ON DELETE CASCADE

### `purchase_items`
- id: INT AUTO_INCREMENT PRIMARY KEY
- purchase_id: INT NOT NULL
- ticket_id: INT NOT NULL

Índices/constraints:
- UNIQUE(purchase_id, ticket_id)
- FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE
- FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE RESTRICT

### `payments`
- id: INT AUTO_INCREMENT PRIMARY KEY
- purchase_id: INT NOT NULL UNIQUE
- wompi_reference: VARCHAR(255) NOT NULL UNIQUE
- amount: DECIMAL(10,2) NOT NULL
- status: ENUM('PENDING','APPROVED','DECLINED','VOIDED','ERROR') NOT NULL DEFAULT 'PENDING'
- wompi_status: VARCHAR(100) NULL -- raw status from Wompi
- paid_at: DATETIME NULL
- created_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Índices/constraints:
- UNIQUE(purchase_id)
- UNIQUE(wompi_reference)
- FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE

---

## Enums (equivalentes Prisma / SQL)
- Role: 'ADMIN', 'CUSTOMER'
- TicketStatus: 'AVAILABLE', 'RESERVED', 'SOLD'
- PurchaseStatus: 'PENDING', 'PAID', 'CANCELLED'
- PaymentStatus: 'PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'

---

## Reglas y operaciones críticas
- Reserva atómica: Para reservar N boletos realizar una transacción que ejecute un UPDATE condicional:

  UPDATE tickets
  SET status='RESERVED', reserved_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
  WHERE id IN (...) AND status='AVAILABLE';

  Comprobar filas afectadas == cantidad de tickets solicitados.

- Confirmación por webhook (Wompi): realizar dentro de transacción que actualice `payments`, `purchases` y cambie `tickets` a `SOLD` (o devuelva a AVAILABLE si falla).

- Limpieza reservas expiradas: UPDATE que ponga `status='AVAILABLE'` para reservas con `reserved_until < NOW()`.

- Idempotencia/replay protection: asegurarse de que `wompi_reference` es UNIQUE; rechazar re-procesos si ya hay un `Payment` con ese reference y estado final.

---

## Índices recomendados (revisión de rendimiento)
- `tickets(raffle_id, status)`
- `raffles(draw_date)`
- `purchases(user_id)`
- `payments(wompi_reference)`

---

## Scripts útiles
- Crear esquema con Prisma: `npx prisma migrate dev --name init`
- Generar cliente: `npx prisma generate`
- Seed rápido (ejemplo): script que cree 1 `raffle` y `total_tickets` `tickets` numerados del 1..N.

---

## Notas operacionales
- Considerar crear jobs cron (o Vercel Cron) para limpieza de reservas expiradas cada 5 minutos.
- Backups: configurar dump diario de MySQL y retención mínima de 7 días.
- En producción, usar un usuario de BD con permisos limitados y conexión TLS.

---

Si quieres, genero `prisma/schema.prisma` con este diseño y un `prisma/seed.ts` que cree datos de prueba. ¿Procedo a generarlos ahora?