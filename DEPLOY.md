# Desplegar (web + API + Postgres + Redis)

Este proyecto son **4 piezas**: la web (Next.js), la API (NestJS), Postgres y Redis.
Netlify/Vercel solo hostean la web; para que login/publicar/admin funcionen necesitás
una plataforma que corra la API y las bases.

- **[Render](https://render.com) — GRATIS.** Ver más abajo. Hay un `render.yaml` que
  provisiona todo con un click. Contra: los servicios gratis se *duermen* tras 15 min
  de inactividad (la primera visita tarda ~30s en despertar) y el Postgres free caduca
  a los 90 días.
- **[Railway](https://railway.app) — ~US$5/mes** (crédito de prueba al inicio). Un poco
  más simple y sin dormirse. Pasos en la sección de más abajo.

> Antes de empezar: **commiteá y pusheá** todo a `main`. Ambas plataformas despliegan lo
> que está en GitHub, no lo que tenés local.

---

# Opción A · Render (gratis, con Blueprint)

Ya hay un **`render.yaml`** en la raíz que define los 4 recursos y cablea las variables
entre ellos. Solo tenés que aplicarlo:

1. Entrá a https://render.com → **Get Started** → *Sign in with GitHub*.
2. **New → Blueprint** → conectá/elegí el repo **`GT-dealership`** → Render detecta
   `render.yaml` → **Apply**.
3. Esperá a que terminen los 4 recursos (el primer build tarda unos minutos). El orden
   y las variables (`DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `CORS_ORIGIN`,
   `PUBLIC_URL`, `NEXT_PUBLIC_API_URL`) los resuelve el Blueprint solo.
4. **Datos demo (una sola vez):** en el servicio `gt-dealership-api` → pestaña **Shell**:
   ```
   pnpm --filter @concesionario/api db:seed
   pnpm --filter @concesionario/api exec tsx prisma/seeds/vehiculos-demo.ts
   ```

Abrí `https://gt-dealership-web.onrender.com`. ¡Listo!

> **Si Render cambió algún nombre** (le agrega un sufijo si ya está tomado), las URLs
> `onrender.com` no coincidirán. Corregí a mano estas 3 variables con las URLs reales y
> redeployá la web: `PUBLIC_URL` y `CORS_ORIGIN` (en la API) y `NEXT_PUBLIC_API_URL`
> (en la web).

---

# Opción B · Railway (de pago, más simple)

> Antes de empezar: **commiteá y pusheá** todo a `main`. Railway despliega lo que está
> en GitHub, no lo que tenés local.

---

## 1. Crear el proyecto y las bases

1. Entrá a Railway → **New Project** → **Deploy from GitHub repo** → elegí `GT-dealership`.
2. Dentro del proyecto: **New → Database → PostgreSQL**. Repetí con **Redis**.

## 2. Servicio API

En el servicio que se creó del repo (renombralo a `api`):

**Settings → Build**
- Root Directory: `/` (la raíz del repo — es un monorepo pnpm)
- Build Command:
  ```
  pnpm install --frozen-lockfile && pnpm --filter @concesionario/shared build && pnpm --filter @concesionario/api db:generate && pnpm --filter @concesionario/api build
  ```
- Start Command:
  ```
  pnpm --filter @concesionario/api db:deploy && pnpm --filter @concesionario/api start
  ```
  (`db:deploy` aplica las migraciones en cada arranque; es idempotente.)

**Settings → Variables**
| Variable | Valor |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| `JWT_ACCESS_SECRET` | generá uno: `openssl rand -base64 48` |
| `PUBLIC_URL` | el dominio de esta API (lo generás abajo), ej. `https://api-xxxx.up.railway.app` |
| `CORS_ORIGIN` | el dominio de la web (lo seteás en el paso 4) |

`PORT` lo inyecta Railway solo — no lo pongas.

**Settings → Networking → Generate Domain** → copiá el dominio de la API.
Poné ese dominio en `PUBLIC_URL`.

## 3. Servicio web

**New → GitHub Repo → el mismo repo.** Renombralo a `web`.

**Settings → Build**
- Root Directory: `/`
- Build Command:
  ```
  pnpm install --frozen-lockfile && pnpm --filter @concesionario/shared build && pnpm --filter @concesionario/web build
  ```
- Start Command:
  ```
  pnpm --filter @concesionario/web start
  ```

**Settings → Variables**
| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<dominio-de-la-api>/api` (¡con `/api` al final!) |

> `NEXT_PUBLIC_API_URL` se **inyecta en el build**. Si cambiás el dominio de la API,
> hay que redeployar la web para que tome el nuevo valor.

**Settings → Networking → Generate Domain** → copiá el dominio de la web.

## 4. Cerrar el círculo (CORS)

Volvé al servicio **api → Variables** y poné `CORS_ORIGIN` = el dominio de la web
(ej. `https://web-xxxx.up.railway.app`, sin barra al final). Redeploy de la API.

## 5. Cargar datos demo (una sola vez)

En el servicio **api**, abrí una terminal (icono de la consola / "Run command") y corré:

```
pnpm --filter @concesionario/api db:seed
pnpm --filter @concesionario/api exec tsx prisma/seeds/vehiculos-demo.ts
```

- El primero carga el catálogo (marcas, modelos, carrocerías, ubicaciones…).
- El segundo publica autos demo con fotos placeholder y crea un vendedor de prueba
  (la consola imprime su email y contraseña). Así el sitio no se ve vacío.

## Listo

Abrí el dominio de la web. Debería cargar en inglés (con el toggle EN/ES en el navbar),
con los autos demo, login, publicar y `/admin` funcionando.

---

### Notas
- **Imágenes subidas:** en el MVP se guardan en disco local. En Railway el disco es
  efímero: las fotos que suban los usuarios se pierden al redeployar. Para un demo está
  bien (los autos demo usan fotos de un CDN externo, ya permitido en `next.config.ts`).
  Para persistirlas de verdad hay que migrar el `UPLOAD_DIR` a un bucket S3/R2.
- **Orden importa:** desplegá primero la API (para tener su dominio), después la web.
- **Chequeo rápido de la API:** `https://<api>/api/salud` debería responder 200.
