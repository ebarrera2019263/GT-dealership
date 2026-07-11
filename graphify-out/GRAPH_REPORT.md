# Graph Report - .  (2026-07-11)

## Corpus Check
- Corpus is ~23,890 words - fits in a single context window. You may not need a graph.

## Summary
- 549 nodes · 797 edges · 24 communities (22 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22

## God Nodes (most connected - your core abstractions)
1. `PrismaService` - 26 edges
2. `VehiculosService` - 22 edges
3. `UsuarioAutenticado` - 21 edges
4. `compilerOptions` - 19 edges
5. `compilerOptions` - 16 edges
6. `UsuarioActual` - 14 edges
7. `AuthService` - 13 edges
8. `CatalogoService` - 13 edges
9. `CatalogoController` - 12 edges
10. `MisVehiculosController` - 12 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  apps/api/src/main.ts → apps/api/src/app.module.ts

## Import Cycles
- None detected.

## Communities (24 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (30): AppModule, Module, Env, envSchema, bootstrap(), AdminModule, Module, AuthModule (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (25): AuditoriaService, RegistroAuditoria, Injectable, AdminController, Controller, Get, Roles, Roles() (+17 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (37): LoginInput, loginSchema, PerfilUpdateInput, perfilUpdateSchema, RefreshInput, refreshSchema, RegistroInput, registroSchema (+29 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (17): UsuarioAutenticado, UsuarioActual, Body, Ip, Param, MisVehiculosController, Body, Controller (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (31): metadata, nextConfig, files, includes, formatter, enabled, indentStyle, indentWidth (+23 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (31): devDependencies, @nestjs/cli, @nestjs/testing, prisma, tsx, @types/express, @types/node, typescript (+23 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (29): dependencies, @concesionario/shared, next, react, react-dom, devDependencies, tailwindcss, @tailwindcss/postcss (+21 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (14): Injectable, ZodValidationPipe, Publico(), LeadsController, Body, Controller, HttpCode, Post (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (7): CatalogoController, Controller, Get, Param, Publico, CatalogoService, Injectable

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (25): dependencies, argon2, @concesionario/shared, dotenv, @nestjs/common, @nestjs/core, @nestjs/jwt, @nestjs/platform-express (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (24): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (9): AuthController, Body, Controller, HttpCode, Post, Publico, Throttle, AuthService (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.10
Nodes (19): @biomejs/biome, devDependencies, @biomejs/biome, engines, node, name, packageManager, private (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (17): dependencies, zod, devDependencies, typescript, vitest, typescript, vitest, zod (+9 more)

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+9 more)

### Community 16 - "Community 16"
Cohesion: 0.21
Nodes (14): main(), prisma, seedCaracteristicas(), seedMarcasYModelos(), seedSimples(), seedTipoCambio(), seedUbicaciones(), slugify() (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (8): MiController, Body, Controller, Get, Put, PERFIL_SELECT, Injectable, UsuariosService

### Community 18 - "Community 18"
Cohesion: 0.21
Nodes (6): Controller, Get, Param, Publico, VehiculosPublicoController, Query

### Community 19 - "Community 19"
Cohesion: 0.20
Nodes (9): exclude, extends, include, dist, node_modules, src/**/*, **/*.spec.ts, test (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (6): collection, compilerOptions, deleteOutDir, tsConfigPath, $schema, sourceRoot

## Knowledge Gaps
- **206 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `tsConfigPath` (+201 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PrismaService` connect `Community 1` to `Community 0`, `Community 3`, `Community 8`, `Community 9`, `Community 17`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `VehiculosService` connect `Community 3` to `Community 0`, `Community 1`, `Community 18`, `Community 8`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `UsuarioAutenticado` connect `Community 3` to `Community 0`, `Community 1`, `Community 17`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _207 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06471631205673758 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06553911205073996 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05204872646733112 - nodes in this community are weakly interconnected._