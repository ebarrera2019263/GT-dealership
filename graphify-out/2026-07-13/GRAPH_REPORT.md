# Graph Report - concesionario  (2026-07-13)

## Corpus Check
- 203 files · ~69,727 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1593 nodes · 2757 edges · 161 communities (81 shown, 80 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `024e31df`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Admin catálogo
- Moderación de vehículos
- Dependencias del proyecto
- Arquitectura del marketplace (docs)
- Dependencias API (NestJS)
- Config build API
- Admin financiamiento
- Auth y páginas (web)
- Filtros admin (Zod)
- Favoritos y citas
- Citas y notificaciones
- Cliente API / listados (web)
- shadcn/ui (componentes)
- Búsquedas guardadas
- Config TypeScript
- Config Biome (lint)
- Validación Zod (API)
- Catálogo maestro
- Reportes
- Solicitudes de crédito
- Simulador de financiamiento
- Mensajería
- Imágenes (uploads)
- Config TypeScript (web)
- Financiamiento (cuota nivelada)
- Prisma / Auditoría
- Helpers de pruebas (API)
- Módulos raíz (NestJS)
- Autenticación (API)
- Botón favorito (web)
- Config shadcn
- Páginas auth/admin (web)
- Scripts npm
- Seed y catálogo maestro
- Admin (núcleo)
- Panel vendedor (transiciones)
- Estados del anuncio (shared)
- Leads
- Formulario de publicación
- Dependencias (paquete)
- tsconfig.json
- UsuariosService
- vehiculos.service.ts
- notificaciones.module.ts
- page.tsx
- auth.ts
- AdminUsuariosController
- page.tsx
- auth.service.ts
- publico.decorator.ts
- index.ts
- Pipeline de graphify (/graphify)
- exclude
- reportes.ts
- page.tsx
- busquedas.ts
- nest-cli.json
- citas.ts
- Body
- page.tsx
- JwtAuthGuard
- page.tsx
- page.tsx
- RolesGuard
- Anti-references (evitar plantill
- prepare-db.sh
- next-env.d.ts
- URL_API_PUBLICA
- Usuarios (compradores y vendedor
- Concesionario — Marketplace de vehículos usados (Guatemala)
- VehiculosPublicoController
- graphify reference: query, path, explain
- Handoff — estado del trabajo (2026-07-11, actualizado)
- NotificacionesService
- package.json
- .lista
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- @concesionario/shared
- @nestjs/bullmq
- @nestjs/core
- @nestjs/jwt
- @nestjs/schedule
- sharp
- zod
- extraction-spec.md
- Exports extra (wiki, Neo4j, FalkorDB, SVG, GraphML, MCP)
- Extraction spec (prompt del subagente)
- Clone de GitHub y merge cross-repo
- Commit hook e integración con CLAUDE.md
- Flujo query / path / explain
- Transcribir video / audio (Whisper)
- Flujo update incremental / cluster-only
- Pipeline de graphify (/graphify)
- Autorización en dos niveles (@Roles + propiedad)
- Backend NestJS (no Laravel)
- VIN y placa nunca en la API pública
- Regla: máquina de estados del anuncio
- Mensajería interna desde el MVP
- Mirá el grafo del proyecto primero
- Multi-moneda GTQ/USD con tipo de cambio
- Qué es el proyecto (marketplace de clasificados)
- Validación con Zod en el servidor
- Servicio Postgres (:5433, postgres:16-alpine)
- Servicio Redis (:6379, redis:7-alpine)
- Fase 0 completa (monorepo, schema Prisma, auth JWT)
- Fase 1 backend núcleo (módulo vehiculos verificado)
- Fase 1 pendiente (imágenes, frontend público, mensajería, worker BullMQ, OTP)
- MAPA_TRACCION (mapeo 4x2/4x4/AWD ↔ T4X2/T4X4/AWD)
- Actores y roles (visitante, comprador, vendedor, concesionario, admin)
- API — endpoints principales (públicos, auth, vendedor, admin)
- Arquitectura general (web/admin/vendedor → API → Postgres/Redis/workers)
- Auditoría (quién hizo qué, datos antes/después)
- Búsqueda (índices SQL → Meilisearch tras 50k anuncios)
- Catálogo maestro (marcas, modelos, carrocerías, departamentos)
- Checklist antes de escribir la primera línea (§10)
- Estructura de carpetas (apps/web, apps/api, packages/shared)
- Fases de desarrollo (0 a 5)
- Financiamiento (entidades, planes, solicitudes de crédito)
- Fórmula de cuota nivelada
- Interacción (favoritos, conversaciones, mensajes, leads, citas, reportes)
- Máquina de estados del anuncio (§4)
- Módulos del panel admin (10 módulos)
- Monetización (planes, suscripciones, pagos)
- Seguridad y calidad (autorización, validación, antifraude)
- SEO técnico (schema.org/Vehicle, sitemap, SSR)
- Modelo usuarios y concesionarios
- Tabla vehiculos (tabla central, precio, VIN, estado)
- Workspace pnpm (apps/*, packages/*)
- Accessibility & Inclusion (AA, reduced-motion, mobile-first)
- Propósito del producto (conecta, no vende)
- Decisiones de producto (checklist sección 10)
- Advertencia: no meter Meilisearch en el MVP
- Advertencia: cuidado con templates de marketplace (e-commerce)
- Backend (NestJS, Prisma, BullMQ, Better Auth)
- Búsqueda, imágenes y pagos (Meilisearch, UploadThing, sharp, Stripe, Recurrente)
- Calidad y operación (Playwright, Vitest, Biome, Sentry, Docker)
- Competencias SQL y base de datos (prioridad)
- Frontend (Next.js, Tailwind, shadcn/ui, TanStack, Zod)
- Stack final recomendado
- .moderar
- AdminVehiculosController
- .obtener
- .listar
- page.tsx
- JwtAuthGuard
- @nestjs/platform-express
- @concesionario/shared
- framer-motion
- lucide-react
- radix-ui
- react

## God Nodes (most connected - your core abstractions)
1. `UsuarioAutenticado` - 115 edges
2. `UsuarioActual` - 74 edges
3. `useAuth()` - 63 edges
4. `PrismaService` - 52 edges
5. `VehiculosService` - 33 edges
6. `AdminCatalogoService` - 30 edges
7. `cn()` - 30 edges
8. `ZodValidationPipe` - 25 edges
9. `AdminCatalogoController` - 23 edges
10. `AuditoriaService` - 21 edges

## Surprising Connections (you probably didn't know these)
- `FavoritosPage()` --calls--> `useAuth()`  [EXTRACTED]
  apps/web/app/favoritos/page.tsx → apps/web/lib/auth.tsx
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  apps/web/app/layout.tsx → apps/web/lib/utils.ts
- `PublicarPage()` --calls--> `useAuth()`  [EXTRACTED]
  apps/web/app/panel/publicar/page.tsx → apps/web/lib/auth.tsx
- `resetTransaccional()` --references--> `@prisma/client`  [EXTRACTED]
  apps/api/test/helpers.ts → apps/api/package.json
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  apps/api/src/main.ts → apps/api/src/app.module.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ciclo de vida del anuncio y su auditoría** — esquema_marketplace_vehiculos_maquina_de_estados, claude_maquina_estados, docs_handoff_fase_1, esquema_marketplace_vehiculos_auditoria [INFERRED 0.85]
- **Decisión multi-moneda GTQ/USD normalizada a precio_gtq** — claude_multi_moneda, esquema_marketplace_vehiculos_vehiculos, docs_handoff_fase_1, readme_decisiones_producto [INFERRED 0.85]
- **Pipeline de graphify (extracción, consulta, actualización)** — _claude_skills_graphify_skill_pipeline, _claude_skills_graphify_references_extraction_spec, _claude_skills_graphify_references_query, _claude_skills_graphify_references_update [EXTRACTED 1.00]

## Communities (161 total, 80 thin omitted)

### Community 0 - "Admin catálogo"
Cohesion: 0.10
Nodes (13): AdminCatalogoController, Body, Controller, Delete, Get, Ip, Param, Patch (+5 more)

### Community 2 - "Dependencias del proyecto"
Cohesion: 0.13
Nodes (15): dependencies, class-variance-authority, clsx, next, react-dom, shadcn, tailwind-merge, tw-animate-css (+7 more)

### Community 3 - "Arquitectura del marketplace (docs)"
Cohesion: 0.04
Nodes (43): 10. Checklist antes de escribir la primera línea, 1. Arquitectura general, 2. Actores y roles, 3.1 Catálogo maestro, 3.2 Usuarios, 3.3 Vehículos — tabla central, 3.4 Interacción, 3.5 Financiamiento (+35 more)

### Community 4 - "Dependencias API (NestJS)"
Cohesion: 0.10
Nodes (21): dependencies, argon2, bullmq, dotenv, multer, @nestjs/common, @nestjs/throttler, nodemailer (+13 more)

### Community 5 - "Config build API"
Cohesion: 0.10
Nodes (21): devDependencies, @nestjs/cli, @nestjs/testing, prisma, tsx, @types/express, @types/multer, @types/node (+13 more)

### Community 6 - "Admin financiamiento"
Cohesion: 0.10
Nodes (16): AdminFinanciamientoController, Body, Controller, Get, Ip, Param, Patch, Post (+8 more)

### Community 7 - "Auth y páginas (web)"
Cohesion: 0.22
Nodes (9): FormularioEntrar(), RegistroPage(), Estado, FormularioLead(), CampoValidado(), CambioEvento, ResultadoParse, SchemaLike (+1 more)

### Community 8 - "Filtros admin (Zod)"
Cohesion: 0.06
Nodes (33): AdminAuditoriaFiltros, adminAuditoriaFiltrosSchema, AdminLeadsFiltros, adminLeadsFiltrosSchema, AdminUsuariosFiltros, adminUsuariosFiltrosSchema, AdminVehiculosFiltros, adminVehiculosFiltrosSchema (+25 more)

### Community 9 - "Favoritos y citas"
Cohesion: 0.11
Nodes (14): UsuarioAutenticado, Get, Get, agregarSchema, FavoritosController, Body, Controller, Delete (+6 more)

### Community 10 - "Citas y notificaciones"
Cohesion: 0.15
Nodes (10): CitasController, Body, Controller, HttpCode, Param, Patch, Post, CitasService (+2 more)

### Community 11 - "Cliente API / listados (web)"
Cohesion: 0.14
Nodes (18): FILTROS_VALIDOS, ListadoPage(), metadata, FavoritosPage(), Home(), Filtros(), CLAVES_CRITERIO, GuardarBusqueda() (+10 more)

### Community 12 - "shadcn/ui (componentes)"
Cohesion: 0.06
Nodes (31): Enlace, EnlaceNav(), esActivo(), Navbar(), PUEDE_VENDER, ThemeToggle(), Button(), buttonVariants (+23 more)

### Community 13 - "Búsquedas guardadas"
Cohesion: 0.12
Nodes (12): BusquedasController, Body, Controller, Delete, HttpCode, Param, Patch, Post (+4 more)

### Community 14 - "Config TypeScript"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 15 - "Config Biome (lint)"
Cohesion: 0.07
Nodes (28): files, includes, formatter, enabled, indentStyle, indentWidth, lineWidth, quoteStyle (+20 more)

### Community 16 - "Validación Zod (API)"
Cohesion: 0.29
Nodes (6): Injectable, ZodValidationPipe, JwtPayload, RequestConUsuario, Roles(), UsuarioActual

### Community 17 - "Catálogo maestro"
Cohesion: 0.14
Nodes (7): CatalogoController, Controller, Get, Param, Publico, CatalogoService, Injectable

### Community 18 - "Reportes"
Cohesion: 0.08
Nodes (19): AdminReportesController, Controller, Get, Ip, Param, Patch, Query, Roles (+11 more)

### Community 19 - "Solicitudes de crédito"
Cohesion: 0.09
Nodes (16): AdminSolicitudesController, Body, Controller, Get, Ip, Param, Patch, Query (+8 more)

### Community 20 - "Simulador de financiamiento"
Cohesion: 0.10
Nodes (26): ModeracionPage(), Pendiente, AdminSolicitudesPage(), ESTADOS, Solicitud, FichaPage(), generateMetadata(), Props (+18 more)

### Community 21 - "Mensajería"
Cohesion: 0.13
Nodes (10): MensajeriaController, Body, Controller, Get, Param, Post, MensajeriaService, PARTICIPANTE (+2 more)

### Community 22 - "Imágenes (uploads)"
Cohesion: 0.12
Nodes (13): ImagenesController, Body, Controller, Delete, HttpCode, Param, Post, Put (+5 more)

### Community 23 - "Config TypeScript (web)"
Cohesion: 0.08
Nodes (24): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 24 - "Financiamiento (cuota nivelada)"
Cohesion: 0.10
Nodes (23): AdminSolicitudesFiltros, adminSolicitudesFiltrosSchema, APLICA_A, AplicaA, calcularCuotaNivelada(), EntidadFinancieraActualizarInput, entidadFinancieraActualizarSchema, EntidadFinancieraCrearInput (+15 more)

### Community 25 - "Prisma / Auditoría"
Cohesion: 0.16
Nodes (8): AuditoriaService, RegistroAuditoria, Injectable, PerfilPublico, TokensEmitidos, PERFIL_SELECT, PrismaService, Injectable

### Community 26 - "Helpers de pruebas (API)"
Cohesion: 0.29
Nodes (12): catalogoBase(), crearAdmin(), crearVehiculo(), prisma, registrar(), req(), ReqOpts, resetTransaccional() (+4 more)

### Community 27 - "Módulos raíz (NestJS)"
Cohesion: 0.09
Nodes (26): AppModule, Module, Env, envSchema, bootstrap(), AuthModule, Module, BusquedasModule (+18 more)

### Community 28 - "Autenticación (API)"
Cohesion: 0.18
Nodes (9): AuthController, Body, Controller, HttpCode, Post, Publico, Throttle, AuthService (+1 more)

### Community 29 - "Botón favorito (web)"
Cohesion: 0.14
Nodes (15): AdminAuditoriaPage(), ENTIDADES, fechaHora(), Registro, resumen(), AdminLeadsPage(), fecha(), Lead (+7 more)

### Community 30 - "Config shadcn"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 31 - "Páginas auth/admin (web)"
Cohesion: 0.07
Nodes (28): AdminCatalogoPage(), Marca, Modelo, AdminFinanciamientoPage(), APLICA_A, Entidad, FORM_VACIO, Plan (+20 more)

### Community 32 - "Scripts npm"
Cohesion: 0.10
Nodes (19): @biomejs/biome, devDependencies, @biomejs/biome, engines, node, name, packageManager, private (+11 more)

### Community 33 - "Seed y catálogo maestro"
Cohesion: 0.19
Nodes (16): FINANCIERAS, main(), prisma, seedCaracteristicas(), seedFinanciamiento(), seedMarcasYModelos(), seedSimples(), seedTipoCambio() (+8 more)

### Community 34 - "Admin (núcleo)"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 35 - "Panel vendedor (transiciones)"
Cohesion: 0.25
Nodes (8): MisVehiculosController, Body, Controller, Ip, Param, Post, Put, Roles

### Community 36 - "Estados del anuncio (shared)"
Cohesion: 0.11
Nodes (18): aprobacionSchema, ESTADOS_VEHICULO, EstadoVehiculoStr, IMAGEN_MIMES_PERMITIDOS, ImagenesReordenarInput, imagenesReordenarSchema, ModeracionInput, moderacionSchema (+10 more)

### Community 37 - "Leads"
Cohesion: 0.07
Nodes (22): AdminLeadsController, Controller, Get, Query, Roles, LeadsController, Body, Controller (+14 more)

### Community 38 - "Formulario de publicación"
Cohesion: 0.16
Nodes (24): PublicarPage(), aValores(), EditarVehiculoPage(), ESTADOS_EDITABLES, VehiculoEdicion, ANIO_ACTUAL, Catalogo, FormularioVehiculo() (+16 more)

### Community 39 - "Dependencias (paquete)"
Cohesion: 0.11
Nodes (17): dependencies, zod, devDependencies, typescript, vitest, typescript, vitest, zod (+9 more)

### Community 40 - "tsconfig.json"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+9 more)

### Community 41 - "UsuariosService"
Cohesion: 0.15
Nodes (7): MiController, Body, Controller, Get, Put, Injectable, UsuariosService

### Community 42 - "vehiculos.service.ts"
Cohesion: 0.17
Nodes (11): NotificacionesModule, Module, ActorTransicion, buscarTransicion(), ESTADOS_EDITABLES, Transicion, TRANSICIONES, Module (+3 more)

### Community 43 - "notificaciones.module.ts"
Cohesion: 0.19
Nodes (9): AdminUsuariosController, Body, Controller, Get, Ip, Param, Patch, Query (+1 more)

### Community 44 - "page.tsx"
Cohesion: 0.09
Nodes (21): Acciones recomendadas (orden de ataque), Arreglos aplicados — 2026-07-12 (los dos P1), Arreglos aplicados — 2026-07-12 (los dos P3), Arreglos aplicados — 2026-07-12 (los tres P2), Auditoría técnica — Storefront (home · /autos · ficha), Cómo retomar, Estado de arreglos (ir tachando), Estado final (+13 more)

### Community 45 - "auth.ts"
Cohesion: 0.14
Nodes (13): LoginInput, loginSchema, PerfilUpdateInput, perfilUpdateSchema, RefreshInput, refreshSchema, RegistroInput, registroSchema (+5 more)

### Community 46 - "AdminUsuariosController"
Cohesion: 0.50
Nodes (4): Conversacion, ConversacionPage(), hora(), Mensaje

### Community 47 - "page.tsx"
Cohesion: 0.18
Nodes (11): scripts, build, db:deploy, db:generate, db:migrate, db:seed, db:studio, dev (+3 more)

### Community 48 - "auth.service.ts"
Cohesion: 0.16
Nodes (9): AdminController, Controller, Get, Query, Roles, AdminModule, Module, AdminService (+1 more)

### Community 49 - "publico.decorator.ts"
Cohesion: 0.17
Nodes (7): Publico(), SaludController, Controller, Get, Publico, SaludModule, Module

### Community 50 - "index.ts"
Cohesion: 0.40
Nodes (4): CANALES_LEAD, CanalLeadStr, LeadCrearInput, leadCrearSchema

### Community 52 - "exclude"
Cohesion: 0.20
Nodes (9): exclude, extends, include, dist, node_modules, src/**/*, **/*.spec.ts, test (+1 more)

### Community 53 - "reportes.ts"
Cohesion: 0.22
Nodes (8): AdminReportesFiltros, adminReportesFiltrosSchema, EstadoReporteStr, ESTADOS_REPORTE, MotivoReporte, MOTIVOS_REPORTE, ReporteCrearInput, reporteCrearSchema

### Community 54 - "page.tsx"
Cohesion: 0.13
Nodes (15): devDependencies, @playwright/test, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript (+7 more)

### Community 55 - "busquedas.ts"
Cohesion: 0.25
Nodes (7): BusquedaActualizarInput, busquedaActualizarSchema, BusquedaCrearInput, busquedaCrearSchema, CriteriosBusqueda, criteriosBusquedaSchema, ORDENES_LISTADO

### Community 56 - "nest-cli.json"
Cohesion: 0.29
Nodes (6): collection, compilerOptions, deleteOutDir, tsConfigPath, $schema, sourceRoot

### Community 57 - "citas.ts"
Cohesion: 0.17
Nodes (8): CitaCrearInput, citaCrearSchema, EstadoCita, ESTADOS_CITA, EnviarMensajeInput, enviarMensajeSchema, IniciarConversacionInput, iniciarConversacionSchema

### Community 59 - "page.tsx"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, start, test:e2e, version

### Community 60 - "JwtAuthGuard"
Cohesion: 0.21
Nodes (11): ANGULOS, BASICOS, COLOR_EN, CONFORT, Entrada, imagenUrl(), main(), PREMIUM (+3 more)

### Community 61 - "page.tsx"
Cohesion: 0.50
Nodes (4): AdminDashboard(), etiquetaMes(), MESES, Metricas

### Community 63 - "RolesGuard"
Cohesion: 0.27
Nodes (6): Controller, Get, Param, Publico, Query, VehiculosPublicoController

### Community 64 - "Anti-references (evitar plantill"
Cohesion: 0.22
Nodes (8): Accessibility & Inclusion, Anti-references, Brand Personality, Design Principles, Product, Product Purpose, Register, Users

### Community 74 - "Usuarios (compradores y vendedor"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 75 - "Concesionario — Marketplace de vehículos usados (Guatemala)"
Cohesion: 0.22
Nodes (8): Concesionario — Marketplace de vehículos usados (Guatemala), Decisiones de producto ya tomadas (no re-preguntar), Entorno local, Estructura, Levantar / bajar todo, Primero: mirá el grafo del proyecto, Qué es este proyecto, Reglas del dominio

### Community 76 - "VehiculosPublicoController"
Cohesion: 0.40
Nodes (5): ACCIONES, EDITABLE, ESTADO_UI, PanelPage(), VehiculoPanel

### Community 77 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 78 - "Handoff — estado del trabajo (2026-07-11, actualizado)"
Cohesion: 0.33
Nodes (5): Contexto que no está en el código, Detalles no obvios del código, Estado general, Fase 1 — lo que FALTA, Handoff — estado del trabajo (2026-07-11, actualizado)

### Community 80 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 81 - ".lista"
Cohesion: 0.47
Nodes (5): BusquedaGuardada, BusquedasPage(), describir(), ETIQUETAS, urlResultados()

### Community 82 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 83 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 84 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 88 - "@concesionario/shared"
Cohesion: 0.32
Nodes (7): anuncio(), BADGE, Cita, CitasPage(), ETIQUETA, fmtFecha(), VehiculoRef

### Community 150 - ".moderar"
Cohesion: 0.18
Nodes (8): ModeracionController, Body, Controller, Get, Ip, Param, Patch, Roles

### Community 151 - "AdminVehiculosController"
Cohesion: 0.22
Nodes (7): AdminVehiculosController, Body, Controller, Ip, Param, Patch, Roles

### Community 156 - "page.tsx"
Cohesion: 0.12
Nodes (13): fraunces, inter, metadata, RootLayout(), metadata, SECCIONES, BotonFavorito(), Contexto (+5 more)

## Knowledge Gaps
- **556 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `tsConfigPath` (+551 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **80 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UsuarioAutenticado` connect `Favoritos y citas` to `Admin catálogo`, `Moderación de vehículos`, `Panel vendedor (transiciones)`, `Admin financiamiento`, `UsuariosService`, `vehiculos.service.ts`, `Citas y notificaciones`, `notificaciones.module.ts`, `Búsquedas guardadas`, `Validación Zod (API)`, `Reportes`, `Solicitudes de crédito`, `Mensajería`, `.moderar`, `AdminVehiculosController`, `Imágenes (uploads)`, `.obtener`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Why does `anuncio()` connect `@concesionario/shared` to `Mensajería`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Why does `IMAGEN_MIMES_PERMITIDOS` connect `Estados del anuncio (shared)` to `Imágenes (uploads)`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _568 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin catálogo` be split into smaller, more focused modules?**
  _Cohesion score 0.10064935064935066 - nodes in this community are weakly interconnected._
- **Should `Dependencias del proyecto` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Arquitectura del marketplace (docs)` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._