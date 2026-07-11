# Graph Report - .  (2026-07-10)

## Corpus Check
- Corpus is ~9,921 words - fits in a single context window. You may not need a graph.

## Summary
- 432 nodes · 549 edges · 21 communities (19 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Guards y módulo admin
- Bootstrap y configuración del API
- Shell del frontend Next.js
- Dependencias dev del API
- Dependencias del frontend
- Config TypeScript del frontend
- Dependencias runtime del API
- Catálogo maestro (endpoints)
- Config TypeScript del API
- Auth: controller y flujo JWT
- Schemas Zod compartidos
- Perfil de usuario (/mi)
- Monorepo raíz y Biome
- Paquete shared (manifiesto)
- Config TypeScript de shared
- Seeds del catálogo
- Build config del API
- Nest CLI
- Página de inicio web
- Tipos de Next.js

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `PrismaService` - 16 edges
3. `compilerOptions` - 16 edges
4. `AuthService` - 13 edges
5. `CatalogoService` - 13 edges
6. `CatalogoController` - 12 edges
7. `compilerOptions` - 12 edges
8. `scripts` - 11 edges
9. `scripts` - 11 edges
10. `AuthController` - 9 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  apps/api/src/main.ts → apps/api/src/app.module.ts

## Import Cycles
- None detected.

## Communities (21 total, 2 thin omitted)

### Community 0 - "Guards y módulo admin"
Cohesion: 0.07
Nodes (18): Injectable, ZodValidationPipe, AdminController, Controller, Get, Publico(), Roles(), SaludController (+10 more)

### Community 1 - "Bootstrap y configuración del API"
Cohesion: 0.09
Nodes (21): AppModule, Module, Env, envSchema, bootstrap(), AdminModule, Module, AuthModule (+13 more)

### Community 2 - "Shell del frontend Next.js"
Cohesion: 0.06
Nodes (31): metadata, nextConfig, files, includes, formatter, enabled, indentStyle, indentWidth (+23 more)

### Community 3 - "Dependencias dev del API"
Cohesion: 0.06
Nodes (31): devDependencies, @nestjs/cli, @nestjs/testing, prisma, tsx, @types/express, @types/node, typescript (+23 more)

### Community 4 - "Dependencias del frontend"
Cohesion: 0.07
Nodes (29): dependencies, @concesionario/shared, next, react, react-dom, devDependencies, tailwindcss, @tailwindcss/postcss (+21 more)

### Community 5 - "Config TypeScript del frontend"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 6 - "Dependencias runtime del API"
Cohesion: 0.08
Nodes (25): dependencies, argon2, @concesionario/shared, dotenv, @nestjs/common, @nestjs/core, @nestjs/jwt, @nestjs/platform-express (+17 more)

### Community 7 - "Catálogo maestro (endpoints)"
Cohesion: 0.14
Nodes (7): CatalogoController, Controller, Get, Publico, CatalogoService, Injectable, Param

### Community 8 - "Config TypeScript del API"
Cohesion: 0.08
Nodes (24): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 9 - "Auth: controller y flujo JWT"
Cohesion: 0.20
Nodes (9): AuthController, Body, Controller, Publico, AuthService, Injectable, HttpCode, Post (+1 more)

### Community 10 - "Schemas Zod compartidos"
Cohesion: 0.11
Nodes (17): LoginInput, loginSchema, PerfilUpdateInput, perfilUpdateSchema, RefreshInput, refreshSchema, RegistroInput, registroSchema (+9 more)

### Community 11 - "Perfil de usuario (/mi)"
Cohesion: 0.16
Nodes (11): UsuarioAutenticado, UsuarioActual, MiController, Body, Controller, Get, Module, UsuariosModule (+3 more)

### Community 12 - "Monorepo raíz y Biome"
Cohesion: 0.10
Nodes (19): @biomejs/biome, devDependencies, @biomejs/biome, engines, node, name, packageManager, private (+11 more)

### Community 13 - "Paquete shared (manifiesto)"
Cohesion: 0.11
Nodes (17): dependencies, zod, devDependencies, typescript, vitest, typescript, vitest, zod (+9 more)

### Community 14 - "Config TypeScript de shared"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+9 more)

### Community 15 - "Seeds del catálogo"
Cohesion: 0.21
Nodes (14): main(), prisma, seedCaracteristicas(), seedMarcasYModelos(), seedSimples(), seedTipoCambio(), seedUbicaciones(), slugify() (+6 more)

### Community 16 - "Build config del API"
Cohesion: 0.20
Nodes (9): exclude, extends, include, dist, node_modules, src/**/*, **/*.spec.ts, test (+1 more)

### Community 17 - "Nest CLI"
Cohesion: 0.29
Nodes (6): collection, compilerOptions, deleteOutDir, tsConfigPath, $schema, sourceRoot

## Knowledge Gaps
- **183 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `tsConfigPath` (+178 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PrismaService` connect `Guards y módulo admin` to `Bootstrap y configuración del API`, `Perfil de usuario (/mi)`, `Catálogo maestro (endpoints)`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `AuthController` connect `Auth: controller y flujo JWT` to `Guards y módulo admin`, `Bootstrap y configuración del API`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _184 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Guards y módulo admin` be split into smaller, more focused modules?**
  _Cohesion score 0.07057057057057058 - nodes in this community are weakly interconnected._
- **Should `Bootstrap y configuración del API` be split into smaller, more focused modules?**
  _Cohesion score 0.0873015873015873 - nodes in this community are weakly interconnected._
- **Should `Shell del frontend Next.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `Dependencias dev del API` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._