# Product

## Register

product

> El proyecto completo es **product** (marketplace con admin, panel de vendedor, formularios).
> Pero las superficies de **storefront** — home, listado `/autos`, ficha `/autos/[slug]` — se
> tratan **brand-forward**: la primera impresión y la confianza importan tanto como la tarea.

## Users

- **Compradores** en Guatemala explorando vehículos usados desde el celular o la compu. No vienen a leer, vienen a buscar, comparar y contactar. Compra importante y cargada de desconfianza (¿el precio es justo?, ¿el auto está bien?, ¿quién vende?).
- **Vendedores** (particulares y concesionarios) que quieren que su anuncio se vea serio y profesional.

## Product Purpose

Marketplace de clasificados de vehículos usados: publicar, moderar, descubrir, contactar y financiar — la plataforma **conecta**, no vende. El éxito es un comprador que encuentra rápido y contacta con confianza, y un vendedor cuyo anuncio se ve creíble.

## Brand Personality

Confiable · claro · premium sin ser pretencioso. Como una **revista premium de autos** (Bring a Trailer, no MercadoLibre): la foto manda, el precio se lee de un vistazo, el diseño se aparta para que el auto brille. Voz directa, en español de Guatemala ("vos"), sin jerga.

## Anti-references

- **Plantilla genérica / "hecho por AI"**: grids de cards idénticas sin jerarquía, eyebrows mayúsculas sobre cada sección, layouts de starter kit.
- **E-commerce saturado (MercadoLibre/Kavak recargado)**: mil badges, colores chillones, densidad agobiante.
- **Editorial-serif-sin-fotos** (el lane saturado de revista): serif itálica + labels mono + columnas con reglas y cero imágenes. Acá la imagen es el auto; ese es el protagonista.

## Design Principles

1. **La foto es el diseño.** El auto manda; la UI se calla para que la fotografía y el precio brillen.
2. **El precio se lee de un vistazo.** Cifras tabulares, jerarquía clara; nunca hay que buscar el número.
3. **Confianza por craft, no por sellos.** Aire, alineación y detalle transmiten seriedad mejor que diez badges.
4. **Un solo acento decisivo.** Azul cobalto (`--color-acento`, `#1a56db`) se usa poco y con intención; el resto es papel + tinta y la foto. (Los tokens `--color-quetzal*` quedan como alias retro-compat apuntando al cobalto.)
5. **Rápido y calmo.** Movimiento sutil e intencional, nunca decorativo; respeta `prefers-reduced-motion`.

## Accessibility & Inclusion

- Contraste AA: texto de cuerpo ≥4.5:1 (subir `musgo` donde haga falta), texto grande ≥3:1.
- `prefers-reduced-motion`: toda animación tiene alternativa de crossfade/instantánea.
- Foco visible en todo lo interactivo (ya se usa `focus-visible:outline-quetzal`).
- Mobile-first: el comprador llega desde el celular.
