# Marketplace de vehículos usados — Esquema del proyecto full stack

> Documento de arquitectura y planificación. Sin código: define **qué** construir y en **qué orden**.

---

## 1. Arquitectura general

```
┌──────────────┐     ┌──────────────┐     ┌───────────────┐
│  Web pública │     │  Panel admin │     │ Panel vendedor│
│  (SSR/SEO)   │     │  (SPA)       │     │ (mismo SPA)   │
└──────┬───────┘     └──────┬───────┘     └──────┬────────┘
       └────────────────────┼────────────────────┘
                            │ REST/JSON + JWT
                     ┌──────▼───────┐
                     │  API Backend │
                     │  rutas →     │
                     │  servicios → │
                     │  repositorio │
                     └──┬────┬───┬──┘
              ┌─────────┘    │   └───────────┐
        ┌─────▼─────┐  ┌─────▼────┐  ┌───────▼────────┐
        │PostgreSQL │  │  Redis   │  │ Almacenamiento │
        │  (datos)  │  │ (caché,  │  │   de imágenes  │
        │           │  │  colas)  │  │  (S3/Cloudinary)│
        └───────────┘  └─────┬────┘  └────────────────┘
                             │
                      ┌──────▼───────┐
                      │   Workers    │
                      │ correos,     │
                      │ alertas,     │
                      │ miniaturas   │
                      └──────────────┘
```

### Stack recomendado

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend público | **Next.js** (React) | Renderizado en servidor: el SEO es crítico en este vertical |
| Panel admin | **React SPA** | Puede vivir en `/admin` del mismo Next |
| Backend | **NestJS** (Node) o **Laravel** (PHP) | Elegí el que domines; ambos encajan |
| Base de datos | **PostgreSQL** | El dominio es claramente relacional |
| Caché y colas | **Redis** | Sesiones, caché de listados, cola de trabajos |
| Imágenes | **Cloudinary** o **S3 + CDN** | Optimización y transformaciones automáticas |
| Autenticación | **JWT** (access + refresh) | Con roles y regla de propiedad |

---

## 2. Actores y roles

| Rol | Puede |
|---|---|
| **Visitante** | Buscar, filtrar, ver fichas, simular financiamiento, contactar por formulario |
| **Comprador** | Todo lo anterior + favoritos, búsquedas guardadas con alertas, mensajería, agendar citas |
| **Vendedor particular** | Publicar y gestionar sus anuncios, ver métricas y leads |
| **Concesionario** | Igual que vendedor + publicaciones múltiples, perfil de agencia, plan de pago |
| **Administrador** | Moderar, gestionar catálogo maestro, usuarios, planes, ver auditoría |

---

## 3. Modelo de datos

### 3.1 Catálogo maestro
*Lo llenás vos, no los usuarios. Sin esto normalizado, los filtros no funcionan bien: nunca dejes que el vendedor escriba la marca a mano.*

| Tabla | Campos |
|---|---|
| `marcas` | id, nombre, slug, logo_url, activo |
| `modelos` | id, **marca_id** →, nombre, slug, activo |
| `carrocerias` | id, nombre (Sedán, SUV, Pick-up, Hatchback, Van, Coupé), slug, icono |
| `combustibles` | id, nombre (Gasolina, Diésel, Híbrido, Eléctrico) |
| `transmisiones` | id, nombre (Manual, Automática, CVT) |
| `caracteristicas` | id, nombre (A/C, cámara de retroceso, sunroof…), categoría |
| `departamentos` | id, nombre |
| `municipios` | id, **departamento_id** →, nombre |

### 3.2 Usuarios

**`usuarios`**
```
id, nombre, email (único), telefono, password_hash,
rol (comprador | vendedor | concesionario | admin),
email_verificado, telefono_verificado,
avatar_url, activo, creado_en, actualizado_en
```

**`concesionarios`** *(perfil extendido, solo para ese rol)*
```
id, usuario_id →, nombre_comercial, nit, direccion,
logo_url, plan_id →, verificado, creado_en
```

### 3.3 Vehículos — tabla central

**`vehiculos`**
```
id, uuid, slug
usuario_id →                        dueño del anuncio
marca_id →, modelo_id →, carroceria_id →
anio, version                       texto libre: "SRV 4x4"
precio, moneda (GTQ | USD), precio_negociable
kilometraje
transmision_id →, combustible_id →
cilindrada, potencia, puertas, color, traccion (4x2 | 4x4 | AWD)
placa_parcial, vin                  privados: solo admin
num_duenos
descripcion
departamento_id →, municipio_id →
estado                              ver máquina de estados
verificado, destacado, destacado_hasta
vistas, contactos                   contadores
publicado_en, expira_en, creado_en, actualizado_en
```

**`vehiculo_imagenes`**
`id, vehiculo_id →, url, url_thumb, orden, es_principal`

**`vehiculo_caracteristicas`** *(N:M)*
`vehiculo_id →, caracteristica_id →`

### 3.4 Interacción

| Tabla | Campos |
|---|---|
| `favoritos` | usuario_id →, vehiculo_id →, creado_en *(PK compuesta)* |
| `conversaciones` | id, vehiculo_id →, comprador_id →, vendedor_id →, ultimo_mensaje_en |
| `mensajes` | id, conversacion_id →, emisor_id →, contenido, leido, creado_en |
| `leads` | id, vehiculo_id →, nombre, telefono, email, canal (formulario/whatsapp/llamada), creado_en |
| `busquedas_guardadas` | id, usuario_id →, criterios (JSONB), alerta_activa, ultima_notificacion |
| `citas` | id, vehiculo_id →, comprador_id →, fecha, estado (pendiente/confirmada/cancelada) |
| `reportes` | id, vehiculo_id →, usuario_id →, motivo, detalle, estado (abierto/resuelto), creado_en |

### 3.5 Financiamiento

| Tabla | Campos |
|---|---|
| `entidades_financieras` | id, nombre, logo_url, activo |
| `planes_financiamiento` | id, entidad_id →, nombre, tasa_anual, plazo_min, plazo_max, enganche_min_pct, requisitos (JSONB), aplica_a (todos/verificados/concesionario), activo |
| `solicitudes_credito` | id, vehiculo_id →, usuario_id →, plan_id →, monto, enganche, plazo, cuota_estimada, estado (enviada/en_revisión/aprobada/rechazada), creado_en |

**Fórmula de cuota nivelada** (la usan front y back; el back es la fuente de verdad):

```
cuota = P · i / (1 − (1 + i)^−n)

P = precio − enganche
i = tasa_anual / 12
n = plazo en meses
```

### 3.6 Monetización

| Tabla | Campos |
|---|---|
| `planes` | id, nombre (Gratis/Pro/Agencia), precio_mensual, max_anuncios, max_fotos, destacados_incluidos |
| `suscripciones` | id, usuario_id →, plan_id →, inicio, fin, estado |
| `pagos` | id, usuario_id →, concepto (suscripcion/destacado), monto, referencia, estado |

### 3.7 Auditoría
*Crítica para el admin: sin esto no sabés quién aprobó o borró qué.*

**`auditoria`**
`id, usuario_id →, accion, entidad, entidad_id, datos_antes (JSONB), datos_despues (JSONB), ip, creado_en`

---

## 4. Máquina de estados del anuncio

```
  borrador ──enviar──▶ en_revision ──aprobar──▶ publicado
                            │                    │  │  │
                            └──rechazar──▶ rechazado │  │
                                                  │  │  └──expira──▶ expirado
                            pausado ◀──pausar─────┘  │
                              │                      │
                              └──reactivar───────────┘
                                                     │
                                    marcar vendido   ▼
                                                  vendido
```

Reglas:
- Solo un **admin** puede mover `en_revision → publicado | rechazado`.
- El **vendedor** puede pausar, reactivar y marcar como vendido.
- Toda transición se registra en `auditoria` con autor y motivo.
- `expira_en` se calcula al publicar (ej. 60 días); un worker expira los vencidos.

---

## 5. API — endpoints principales

### 5.1 Públicos
```
GET  /api/vehiculos          ?marca&modelo&carroceria&anio_min&anio_max
                             &precio_min&precio_max&km_max&transmision
                             &combustible&departamento&orden&pagina
GET  /api/vehiculos/:slug            ficha completa (+ incrementa vistas)
GET  /api/vehiculos/:id/similares
GET  /api/catalogo/marcas            (+ /marcas/:id/modelos)
GET  /api/catalogo/carrocerias
GET  /api/financiamiento/planes
POST /api/financiamiento/simular     { precio, enganche, plazo, plan_id } → cuota
POST /api/leads                      contacto sin necesidad de cuenta
```

### 5.2 Autenticación
```
POST /api/auth/registro
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/verificar-email
POST /api/auth/verificar-telefono    OTP por SMS/WhatsApp
POST /api/auth/recuperar
```

### 5.3 Usuario / vendedor
```
GET   /api/mi/perfil            PUT /api/mi/perfil
GET   /api/mi/vehiculos                    mis anuncios + métricas
POST  /api/mi/vehiculos                    crear (nace en borrador)
PUT   /api/mi/vehiculos/:id
POST  /api/mi/vehiculos/:id/imagenes       subida múltiple
POST  /api/mi/vehiculos/:id/publicar       → en_revision
POST  /api/mi/vehiculos/:id/pausar
POST  /api/mi/vehiculos/:id/vendido
GET   /api/mi/favoritos         POST | DELETE /api/mi/favoritos/:vehiculoId
GET   /api/mi/conversaciones    POST /api/mi/conversaciones/:id/mensajes
GET   /api/mi/busquedas         POST /api/mi/busquedas
POST  /api/mi/solicitudes-credito
```

### 5.4 Admin — `/api/admin/*` (rol admin obligatorio)
```
GET   /admin/metricas                      KPIs del dashboard
GET   /admin/vehiculos                     todos, en cualquier estado
PATCH /admin/vehiculos/:id/estado          aprobar | rechazar (con motivo)
PATCH /admin/vehiculos/:id/verificar
PATCH /admin/vehiculos/:id/destacar
GET   /admin/moderacion/pendientes         cola de revisión
GET   /admin/usuarios                      PATCH suspender | activar | cambiar rol
CRUD  /admin/catalogo/marcas | modelos | carrocerias | caracteristicas
CRUD  /admin/financiamiento/entidades | planes
GET   /admin/solicitudes-credito
GET   /admin/reportes                      PATCH resolver
GET   /admin/leads
GET   /admin/auditoria
```

---

## 6. Módulos del panel admin

| # | Módulo | Contenido |
|---|---|---|
| 1 | **Dashboard** | Anuncios activos, pendientes de revisión, leads del mes, vendidos, gráfico de publicaciones, top marcas |
| 2 | **Vehículos** | Tabla con búsqueda, filtros por estado/marca/vendedor, acciones en lote, exportar |
| 3 | **Alta / edición** | Formulario por pasos + gestor de fotos (reordenar, elegir principal) + vista previa de la ficha |
| 4 | **Moderación** | Cola de `en_revision`: aprobar, rechazar con motivo tipificado, marcar como verificado |
| 5 | **Catálogo maestro** | ABM de marcas, modelos, carrocerías, combustibles, características |
| 6 | **Financiamiento** | Entidades, planes, tasas, plazos; solicitudes de crédito recibidas |
| 7 | **Usuarios** | Listado, roles, verificación, suspensión, historial de anuncios |
| 8 | **Leads y mensajes** | Contactos por anuncio, tasa de respuesta del vendedor |
| 9 | **Reportes** | Denuncias de anuncios fraudulentos o duplicados |
| 10 | **Auditoría** | Quién hizo qué, cuándo y desde dónde |

---

## 7. Estructura de carpetas

```
proyecto/
├── apps/
│   ├── web/                      Next.js — público + /admin
│   │   ├── app/
│   │   │   ├── (public)/         inicio, /autos, /autos/[slug], /financiamiento
│   │   │   ├── (cuenta)/         login, registro, mis-anuncios, publicar
│   │   │   └── admin/            dashboard, vehiculos, moderacion, catalogo…
│   │   ├── components/
│   │   ├── lib/                  cliente HTTP, utilidades
│   │   └── hooks/
│   │
│   └── api/                      Backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── usuarios/
│       │   │   ├── vehiculos/    controller · service · repository · dto · entity
│       │   │   ├── catalogo/
│       │   │   ├── imagenes/
│       │   │   ├── mensajes/
│       │   │   ├── financiamiento/
│       │   │   ├── moderacion/
│       │   │   ├── pagos/
│       │   │   └── admin/
│       │   ├── common/           guards, roles, filtros, paginación
│       │   ├── jobs/             workers: correos, alertas, miniaturas, expiración
│       │   └── config/
│       ├── migrations/
│       └── seeds/                marcas, modelos, departamentos
│
└── packages/
    └── shared/                   tipos e interfaces compartidos front ↔ back
```

---

## 8. Seguridad y calidad

- **Autorización en dos niveles**: guard por rol **+** regla de propiedad (un vendedor solo edita *sus* anuncios).
- **Validación en el servidor, siempre.** La del formulario es cortesía, no seguridad.
- **Imágenes**: validar tipo y tamaño, generar miniaturas en un worker, límite de fotos por plan, marca de agua opcional.
- **Antifraude**:
  - Verificación de teléfono obligatoria para publicar.
  - Detección de fotos duplicadas (hash perceptual).
  - Límite de anuncios para cuentas nuevas.
  - Botón de reporte visible en cada ficha.
- **Rate limiting** en login, registro y formulario de contacto.
- **Datos sensibles** (VIN, placa completa) nunca se exponen en la API pública.

### SEO — no es opcional en este vertical
- URLs limpias: `/autos/toyota/hilux/2019/{id}-{slug}`
- Datos estructurados `schema.org/Vehicle` en cada ficha.
- Sitemap dinámico + `<meta>` únicos por anuncio.
- Renderizado en servidor para listados y fichas.

### Búsqueda
Empezá con **índices SQL**: GIN para texto, B-tree para precio, año y kilometraje.
Migrá a **Meilisearch/Elasticsearch** solo cuando pases de ~50.000 anuncios. No antes.

---

## 9. Fases de desarrollo

| Fase | Alcance | Entregable |
|---|---|---|
| **0 — Base** | Repositorio, BD, migraciones, seeds del catálogo, auth con roles | API que responde y autentica |
| **1 — MVP** | Catálogo público + filtros + ficha + publicar anuncio + contacto por formulario/WhatsApp + moderación mínima | Sitio usable; comprar no requiere cuenta |
| **2 — Cuentas** | Favoritos, búsquedas guardadas con alertas, panel del vendedor con métricas, mensajería interna | Retención de usuarios |
| **3 — Admin completo** | Los 10 módulos, catálogo maestro editable, auditoría, reportes | Operación sin tocar la base a mano |
| **4 — Financiamiento** | Entidades, planes, simulador conectado, solicitudes de crédito | Diferenciador comercial |
| **5 — Monetización** | Suscripciones, anuncios destacados, pasarela de pago | Ingresos |

---

## 10. Checklist antes de escribir la primera línea

- [ ] ¿Moneda única (GTQ) o multi-moneda con tipo de cambio?
- [ ] ¿Publicar es gratis desde el día uno, o con límite?
- [ ] ¿Mensajería interna en el MVP, o solo WhatsApp/teléfono?
- [ ] ¿Quién verifica un vehículo y con qué criterio?
- [ ] ¿Las tasas de financiamiento son reales (convenio con banco) o solo estimaciones?
- [ ] Aviso legal: la plataforma **conecta**, no vende. Deslinde de responsabilidad sobre la transacción.
