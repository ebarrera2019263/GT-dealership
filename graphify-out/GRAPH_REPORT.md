# Graph Report - .  (2026-07-12)

## Corpus Check
- 190 files · ~62,658 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1408 nodes · 2621 edges · 75 communities (69 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.8)
- Token cost: 110,053 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `UsuarioAutenticado` - 115 edges
2. `UsuarioActual` - 74 edges
3. `useAuth()` - 63 edges
4. `PrismaService` - 52 edges
5. `VehiculosService` - 33 edges
6. `AdminCatalogoService` - 30 edges
7. `cn()` - 26 edges
8. `ZodValidationPipe` - 25 edges
9. `AdminCatalogoController` - 23 edges
10. `AuditoriaService` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Anti-references (evitar plantilla genérica / e-commerce saturado)` --semantically_similar_to--> `Advertencia: cuidado con templates de marketplace (e-commerce)`  [INFERRED] [semantically similar]
  PRODUCT.md → stack-y-competencias.md
- `Advertencia: no meter Meilisearch en el MVP` --semantically_similar_to--> `Búsqueda (índices SQL → Meilisearch tras 50k anuncios)`  [INFERRED] [semantically similar]
  stack-y-competencias.md → esquema-marketplace-vehiculos.md
- `Mirá el grafo del proyecto primero` --references--> `Pipeline de graphify (/graphify)`  [INFERRED]
  CLAUDE.md → .claude/skills/graphify/SKILL.md
- `VIN y placa nunca en la API pública` --conceptually_related_to--> `Tabla vehiculos (tabla central, precio, VIN, estado)`  [INFERRED]
  CLAUDE.md → esquema-marketplace-vehiculos.md
- `MAPA_TRACCION (mapeo 4x2/4x4/AWD ↔ T4X2/T4X4/AWD)` --shares_data_with--> `Tabla vehiculos (tabla central, precio, VIN, estado)`  [INFERRED]
  docs/HANDOFF.md → esquema-marketplace-vehiculos.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ciclo de vida del anuncio y su auditoría** — esquema_marketplace_vehiculos_maquina_de_estados, claude_maquina_estados, docs_handoff_fase_1, esquema_marketplace_vehiculos_auditoria [INFERRED 0.85]
- **Decisión multi-moneda GTQ/USD normalizada a precio_gtq** — claude_multi_moneda, esquema_marketplace_vehiculos_vehiculos, docs_handoff_fase_1, readme_decisiones_producto [INFERRED 0.85]
- **Pipeline de graphify (extracción, consulta, actualización)** — _claude_skills_graphify_skill_pipeline, _claude_skills_graphify_references_extraction_spec, _claude_skills_graphify_references_query, _claude_skills_graphify_references_update [EXTRACTED 1.00]

## Communities (75 total, 6 thin omitted)

### Community 0 - "Admin catálogo"
Cohesion: 0.10
Nodes (13): AdminCatalogoController, Body, Controller, Delete, Get, Ip, Param, Patch (+5 more)

### Community 1 - "Moderación de vehículos"
Cohesion: 0.05
Nodes (25): ModeracionController, Body, Controller, Get, Ip, Param, Patch, Roles (+17 more)

### Community 2 - "Dependencias del proyecto"
Cohesion: 0.04
Nodes (48): dependencies, @base-ui/react, class-variance-authority, clsx, @concesionario/shared, lucide-react, next, radix-ui (+40 more)

### Community 3 - "Arquitectura del marketplace (docs)"
Cohesion: 0.05
Nodes (48): Autorización en dos niveles (@Roles + propiedad), Backend NestJS (no Laravel), VIN y placa nunca en la API pública, Entorno local (Postgres :5433, Redis, pnpm dev), Estructura del monorepo (apps/api, apps/web, packages/shared), Regla: máquina de estados del anuncio, Mensajería interna desde el MVP, Multi-moneda GTQ/USD con tipo de cambio (+40 more)

### Community 4 - "Dependencias API (NestJS)"
Cohesion: 0.05
Nodes (37): dependencies, argon2, bullmq, @concesionario/shared, dotenv, multer, @nestjs/bullmq, @nestjs/common (+29 more)

### Community 5 - "Config build API"
Cohesion: 0.06
Nodes (35): devDependencies, @nestjs/cli, @nestjs/testing, prisma, tsx, @types/express, @types/multer, @types/node (+27 more)

### Community 6 - "Admin financiamiento"
Cohesion: 0.10
Nodes (16): AdminFinanciamientoController, Body, Controller, Get, Ip, Param, Patch, Post (+8 more)

### Community 7 - "Auth y páginas (web)"
Cohesion: 0.08
Nodes (24): AdminCatalogoPage(), Marca, Modelo, AdminLayout(), NAV, AdminLeadsPage(), fecha(), Lead (+16 more)

### Community 8 - "Filtros admin (Zod)"
Cohesion: 0.06
Nodes (33): AdminAuditoriaFiltros, adminAuditoriaFiltrosSchema, AdminLeadsFiltros, adminLeadsFiltrosSchema, AdminUsuariosFiltros, adminUsuariosFiltrosSchema, AdminVehiculosFiltros, adminVehiculosFiltrosSchema (+25 more)

### Community 9 - "Favoritos y citas"
Cohesion: 0.11
Nodes (14): UsuarioAutenticado, Get, VEHICULO_SELECT, agregarSchema, FavoritosController, Body, Controller, Delete (+6 more)

### Community 10 - "Citas y notificaciones"
Cohesion: 0.10
Nodes (12): CitasController, Body, Controller, HttpCode, Param, Patch, Post, CitasService (+4 more)

### Community 11 - "Cliente API / listados (web)"
Cohesion: 0.13
Nodes (23): ModeracionPage(), Pendiente, FILTROS_VALIDOS, ListadoPage(), metadata, FichaPage(), generateMetadata(), FavoritosPage() (+15 more)

### Community 12 - "shadcn/ui (componentes)"
Cohesion: 0.12
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 13 - "Búsquedas guardadas"
Cohesion: 0.11
Nodes (13): BusquedasController, Body, Controller, Delete, Get, HttpCode, Param, Patch (+5 more)

### Community 14 - "Config TypeScript"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 15 - "Config Biome (lint)"
Cohesion: 0.07
Nodes (28): files, includes, formatter, enabled, indentStyle, indentWidth, lineWidth, quoteStyle (+20 more)

### Community 16 - "Validación Zod (API)"
Cohesion: 0.28
Nodes (6): Injectable, ZodValidationPipe, JwtPayload, RequestConUsuario, Roles(), UsuarioActual

### Community 17 - "Catálogo maestro"
Cohesion: 0.12
Nodes (9): CatalogoController, Controller, Get, Param, Publico, CatalogoModule, Module, CatalogoService (+1 more)

### Community 18 - "Reportes"
Cohesion: 0.10
Nodes (17): AdminReportesController, Controller, Get, Ip, Param, Patch, Query, Roles (+9 more)

### Community 19 - "Solicitudes de crédito"
Cohesion: 0.09
Nodes (16): AdminSolicitudesController, Body, Controller, Get, Ip, Param, Patch, Query (+8 more)

### Community 20 - "Simulador de financiamiento"
Cohesion: 0.10
Nodes (21): AdminSolicitudesPage(), ESTADOS, Solicitud, AdminVehiculosPage(), ESTADO_UI, ESTADOS, Fila, ACCIONES (+13 more)

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
Cohesion: 0.18
Nodes (6): AuditoriaService, RegistroAuditoria, Injectable, PERFIL_SELECT, PrismaService, Injectable

### Community 26 - "Helpers de pruebas (API)"
Cohesion: 0.29
Nodes (12): catalogoBase(), crearAdmin(), crearVehiculo(), prisma, registrar(), req(), ReqOpts, resetTransaccional() (+4 more)

### Community 27 - "Módulos raíz (NestJS)"
Cohesion: 0.10
Nodes (19): BusquedasModule, Module, FavoritosModule, Module, FinanciamientoModule, Module, LeadsModule, Module (+11 more)

### Community 28 - "Autenticación (API)"
Cohesion: 0.18
Nodes (9): AuthController, Body, Controller, HttpCode, Post, Publico, Throttle, AuthService (+1 more)

### Community 29 - "Botón favorito (web)"
Cohesion: 0.11
Nodes (15): fraunces, inter, metadata, RootLayout(), metadata, SECCIONES, BotonFavorito(), NavUsuario() (+7 more)

### Community 30 - "Config shadcn"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 31 - "Páginas auth/admin (web)"
Cohesion: 0.11
Nodes (17): AdminAuditoriaPage(), ENTIDADES, fechaHora(), Registro, resumen(), AdminFinanciamientoPage(), APLICA_A, Entidad (+9 more)

### Community 32 - "Scripts npm"
Cohesion: 0.10
Nodes (19): @biomejs/biome, devDependencies, @biomejs/biome, engines, node, name, packageManager, private (+11 more)

### Community 33 - "Seed y catálogo maestro"
Cohesion: 0.19
Nodes (16): FINANCIERAS, main(), prisma, seedCaracteristicas(), seedFinanciamiento(), seedMarcasYModelos(), seedSimples(), seedTipoCambio() (+8 more)

### Community 34 - "Admin (núcleo)"
Cohesion: 0.16
Nodes (9): AdminController, Controller, Get, Query, Roles, AdminModule, Module, AdminService (+1 more)

### Community 35 - "Panel vendedor (transiciones)"
Cohesion: 0.20
Nodes (9): MisVehiculosController, Body, Controller, Get, Ip, Param, Post, Put (+1 more)

### Community 36 - "Estados del anuncio (shared)"
Cohesion: 0.11
Nodes (18): aprobacionSchema, ESTADOS_VEHICULO, EstadoVehiculoStr, IMAGEN_MIMES_PERMITIDOS, ImagenesReordenarInput, imagenesReordenarSchema, ModeracionInput, moderacionSchema (+10 more)

### Community 37 - "Leads"
Cohesion: 0.18
Nodes (10): AdminLeadsController, Controller, Get, Query, Roles, LeadsController, Controller, Publico (+2 more)

### Community 38 - "Formulario de publicación"
Cohesion: 0.29
Nodes (15): ANIO_ACTUAL, Catalogo, FormularioVehiculo(), ValoresVehiculo, Caracteristica, cargarCaracteristicas(), cargarCarrocerias(), cargarCombustibles() (+7 more)

### Community 39 - "Dependencias (paquete)"
Cohesion: 0.11
Nodes (17): dependencies, zod, devDependencies, typescript, vitest, typescript, vitest, zod (+9 more)

### Community 40 - "tsconfig.json"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+9 more)

### Community 41 - "UsuariosService"
Cohesion: 0.17
Nodes (7): MiController, Body, Controller, Get, Put, Injectable, UsuariosService

### Community 42 - "vehiculos.service.ts"
Cohesion: 0.20
Nodes (9): ActorTransicion, buscarTransicion(), ESTADOS_EDITABLES, Transicion, TRANSICIONES, Module, VehiculosModule, DATOS_PRIVADOS (+1 more)

### Community 43 - "notificaciones.module.ts"
Cohesion: 0.17
Nodes (9): CitasModule, Module, MensajeriaModule, Module, NotificacionesModule, Module, NotificacionesProcessor, EmailJob (+1 more)

### Community 44 - "page.tsx"
Cohesion: 0.17
Nodes (10): Props, AgendarVisita(), BotonReporte(), Estado, MOTIVOS, ContactarVendedor(), Estado, FormularioLead() (+2 more)

### Community 45 - "auth.ts"
Cohesion: 0.14
Nodes (13): LoginInput, loginSchema, PerfilUpdateInput, perfilUpdateSchema, RefreshInput, refreshSchema, RegistroInput, registroSchema (+5 more)

### Community 46 - "AdminUsuariosController"
Cohesion: 0.19
Nodes (9): AdminUsuariosController, Body, Controller, Get, Ip, Param, Patch, Query (+1 more)

### Community 47 - "page.tsx"
Cohesion: 0.24
Nodes (10): PublicarPage(), aValores(), EditarVehiculoPage(), ESTADOS_EDITABLES, VehiculoEdicion, PayloadVehiculo, Imagen, UploaderFotos() (+2 more)

### Community 48 - "auth.service.ts"
Cohesion: 0.22
Nodes (9): AppModule, Module, Env, envSchema, bootstrap(), AuthModule, Module, PerfilPublico (+1 more)

### Community 49 - "publico.decorator.ts"
Cohesion: 0.23
Nodes (5): Publico(), SaludController, Controller, Get, Publico

### Community 50 - "index.ts"
Cohesion: 0.18
Nodes (8): CANALES_LEAD, CanalLeadStr, LeadCrearInput, leadCrearSchema, EnviarMensajeInput, enviarMensajeSchema, IniciarConversacionInput, iniciarConversacionSchema

### Community 51 - "Pipeline de graphify (/graphify)"
Cohesion: 0.29
Nodes (10): graphify add URL y --watch, Exports extra (wiki, Neo4j, FalkorDB, SVG, GraphML, MCP), Extraction spec (prompt del subagente), Clone de GitHub y merge cross-repo, Commit hook e integración con CLAUDE.md, Flujo query / path / explain, Transcribir video / audio (Whisper), Flujo update incremental / cluster-only (+2 more)

### Community 52 - "exclude"
Cohesion: 0.20
Nodes (9): exclude, extends, include, dist, node_modules, src/**/*, **/*.spec.ts, test (+1 more)

### Community 53 - "reportes.ts"
Cohesion: 0.22
Nodes (8): AdminReportesFiltros, adminReportesFiltrosSchema, EstadoReporteStr, ESTADOS_REPORTE, MotivoReporte, MOTIVOS_REPORTE, ReporteCrearInput, reporteCrearSchema

### Community 54 - "page.tsx"
Cohesion: 0.32
Nodes (7): anuncio(), BADGE, Cita, CitasPage(), ETIQUETA, fmtFecha(), VehiculoRef

### Community 55 - "busquedas.ts"
Cohesion: 0.25
Nodes (7): BusquedaActualizarInput, busquedaActualizarSchema, BusquedaCrearInput, busquedaCrearSchema, CriteriosBusqueda, criteriosBusquedaSchema, ORDENES_LISTADO

### Community 56 - "nest-cli.json"
Cohesion: 0.29
Nodes (6): collection, compilerOptions, deleteOutDir, tsConfigPath, $schema, sourceRoot

### Community 57 - "citas.ts"
Cohesion: 0.33
Nodes (4): CitaCrearInput, citaCrearSchema, EstadoCita, ESTADOS_CITA

### Community 58 - "Body"
Cohesion: 0.33
Nodes (4): Body, HttpCode, Post, Throttle

### Community 59 - "page.tsx"
Cohesion: 0.47
Nodes (5): BusquedaGuardada, BusquedasPage(), describir(), ETIQUETAS, urlResultados()

### Community 61 - "page.tsx"
Cohesion: 0.50
Nodes (4): AdminDashboard(), etiquetaMes(), MESES, Metricas

### Community 62 - "page.tsx"
Cohesion: 0.50
Nodes (4): Conversacion, ConversacionPage(), hora(), Mensaje

### Community 64 - "Anti-references (evitar plantill"
Cohesion: 0.50
Nodes (4): Anti-references (evitar plantilla genérica / e-commerce saturado), Brand Personality (revista premium de autos), Design Principles (la foto es el diseño), Advertencia: cuidado con templates de marketplace (e-commerce)

## Knowledge Gaps
- **401 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `tsConfigPath` (+396 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UsuarioAutenticado` connect `Favoritos y citas` to `Admin catálogo`, `Moderación de vehículos`, `Panel vendedor (transiciones)`, `Admin financiamiento`, `UsuariosService`, `vehiculos.service.ts`, `Citas y notificaciones`, `Búsquedas guardadas`, `AdminUsuariosController`, `Validación Zod (API)`, `Reportes`, `Solicitudes de crédito`, `Mensajería`, `Imágenes (uploads)`?**
  _High betweenness centrality (0.244) - this node is a cross-community bridge._
- **Why does `anuncio()` connect `page.tsx` to `Mensajería`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Why does `IMAGEN_MIMES_PERMITIDOS` connect `Estados del anuncio (shared)` to `Imágenes (uploads)`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _407 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin catálogo` be split into smaller, more focused modules?**
  _Cohesion score 0.10064935064935066 - nodes in this community are weakly interconnected._
- **Should `Moderación de vehículos` be split into smaller, more focused modules?**
  _Cohesion score 0.05380852550663871 - nodes in this community are weakly interconnected._
- **Should `Dependencias del proyecto` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._