# UI Spec — ArisRifas (Home)

## Paleta
- Primario: `#10B981` (emerald-500) — botones principales
- Secundario: `#F59E0B` (amber-500) — acentos
- Fondo: `#F8FAFC` (slate-50) / `#FFFFFF`
- Texto: `#0F172A` (slate-900)
- Muted: `#64748B` (slate-500)

## Tipografía
- Familia: Inter (preferible), fallback system sans
- Heading: 700 (H1 ~36px desktop, 28px mobile)
- Body: 400 (16px)

## Espaciado
- Base: 4px
- Small gap: 8px (2)
- Default gap: 16px (4)
- Large gap: 32px (8)

## Componentes
- `HeroBanner`: imagen/ilustración + mensaje + CTA primaria/segunda
- `RaffleCard`: imagen, título, descripción corta, precio, boletos restantes, progress bar, CTA
- `RaffleGrid`: responsive grid de tarjetas (1col mobile, 2-3 cols desktop)

## Comportamiento
- CTA principal con color primario y sombra ligera
- Mostrar `remaining` con badge si quedan pocos boletos
- Progress bar para porcentaje vendido

## Assets sugeridos
- Iconos: Heroicons
- Ilustraciones: SVG vectoriales (tickets / confetti)

---
Implementación rápida: los componentes están en `frontend/components/` y mock data en `frontend/data/mockRaffles.ts`.
