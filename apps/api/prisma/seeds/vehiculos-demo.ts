/**
 * Seed de vehículos demo (2 por marca) bajo "Vendedor Demo" (vendedor@demo.gt).
 * Publicados y SIN imágenes: las fotos se suben luego desde el panel del vendedor.
 *
 * Idempotente: usa slugs estables (`-demoNN`); si ya existen, los salta.
 * Además (re)establece la contraseña del vendedor demo a una conocida para
 * poder iniciar sesión y subir las fotos.
 *
 * Correr:  pnpm --filter @concesionario/api exec tsx prisma/seeds/vehiculos-demo.ts
 */
import { PrismaClient, type Traccion } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const VENDEDOR_EMAIL = 'vendedor@demo.gt';
const VENDEDOR_PASSWORD = 'Demo1234!';

function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type Entrada = {
  marca: string;
  modelo: string;
  carroceria: string;
  anio: number;
  version: string;
  precio: number;
  moneda: 'GTQ' | 'USD';
  km: number;
  transmision: string;
  combustible: string;
  traccion: Traccion;
  color: string;
  departamento: string;
  destacado?: boolean;
  verificado?: boolean;
  caracteristicas: string[];
};

// Placeholders: renders por marca/modelo/color vía imagin.studio (webp, sin key).
// Reemplazá estas fotos por las reales del vehículo cuando las tengas.
const COLOR_EN: Record<string, string> = {
  Blanco: 'white', Gris: 'grey', Plata: 'silver', Rojo: 'red',
  Negro: 'black', Azul: 'blue', Verde: 'green', Amarillo: 'yellow',
};
const ANGULOS = ['23', '21', '17', '09', '13']; // 3/4 frontal (principal) → lateral → trasera

function imagenUrl(e: Entrada, angle: string, width: number): string {
  const q = new URLSearchParams({
    customer: 'img',
    make: slugify(e.marca),
    modelFamily: slugify(e.modelo),
    modelYear: String(e.anio),
    angle,
    paintDescription: COLOR_EN[e.color] ?? 'white',
    width: String(width),
  });
  return `https://cdn.imagin.studio/getimage?${q.toString()}`;
}

const BASICOS = ['Aire acondicionado', 'Bolsas de aire', 'Frenos ABS', 'Vidrios eléctricos'];
const CONFORT = ['Bluetooth', 'Cámara de retroceso', 'Apple CarPlay / Android Auto', 'Aros de aluminio'];
const PREMIUM = ['Asientos de cuero', 'Sunroof', 'Sensores de parqueo', 'Luces LED', 'GPS integrado'];

// 2 vehículos por cada marca del catálogo maestro (ver seeds/catalogo.ts).
const VEHICULOS: Entrada[] = [
  // Toyota
  { marca: 'Toyota', modelo: 'Corolla', carroceria: 'Sedán', anio: 2020, version: 'XLI', precio: 115000, moneda: 'GTQ', km: 68000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'T4X2', color: 'Blanco', departamento: 'Guatemala', verificado: true, caracteristicas: [...BASICOS, ...CONFORT] },
  { marca: 'Toyota', modelo: 'RAV4', carroceria: 'SUV', anio: 2021, version: 'XLE Hybrid', precio: 32000, moneda: 'USD', km: 41000, transmision: 'Automática', combustible: 'Híbrido', traccion: 'AWD', color: 'Gris', departamento: 'Guatemala', destacado: true, verificado: true, caracteristicas: [...BASICOS, ...CONFORT, ...PREMIUM] },
  // Honda
  { marca: 'Honda', modelo: 'Civic', carroceria: 'Sedán', anio: 2018, version: 'EX', precio: 128000, moneda: 'GTQ', km: 72000, transmision: 'CVT', combustible: 'Gasolina', traccion: 'T4X2', color: 'Rojo', departamento: 'Quetzaltenango', caracteristicas: [...BASICOS, ...CONFORT] },
  { marca: 'Honda', modelo: 'CR-V', carroceria: 'SUV', anio: 2020, version: 'Touring', precio: 27500, moneda: 'USD', km: 55000, transmision: 'CVT', combustible: 'Gasolina', traccion: 'AWD', color: 'Negro', departamento: 'Sacatepéquez', destacado: true, verificado: true, caracteristicas: [...BASICOS, ...CONFORT, ...PREMIUM] },
  // Nissan
  { marca: 'Nissan', modelo: 'Sentra', carroceria: 'Sedán', anio: 2019, version: 'Advance', precio: 118000, moneda: 'GTQ', km: 63000, transmision: 'CVT', combustible: 'Gasolina', traccion: 'T4X2', color: 'Plata', departamento: 'Guatemala', caracteristicas: [...BASICOS, ...CONFORT] },
  { marca: 'Nissan', modelo: 'Frontier', carroceria: 'Pick-up', anio: 2021, version: 'PRO-4X', precio: 275000, moneda: 'GTQ', km: 47000, transmision: 'Automática', combustible: 'Diésel', traccion: 'T4X4', color: 'Blanco', departamento: 'Izabal', verificado: true, caracteristicas: [...BASICOS, ...CONFORT, 'Barras de techo'] },
  // Mitsubishi
  { marca: 'Mitsubishi', modelo: 'L200', carroceria: 'Pick-up', anio: 2019, version: 'Sportero', precio: 198000, moneda: 'GTQ', km: 94000, transmision: 'Manual', combustible: 'Diésel', traccion: 'T4X4', color: 'Plata', departamento: 'Petén', caracteristicas: [...BASICOS, 'Cámara de retroceso'] },
  { marca: 'Mitsubishi', modelo: 'Outlander', carroceria: 'SUV', anio: 2020, version: 'GLS', precio: 24500, moneda: 'USD', km: 58000, transmision: 'CVT', combustible: 'Gasolina', traccion: 'AWD', color: 'Gris', departamento: 'Guatemala', verificado: true, caracteristicas: [...BASICOS, ...CONFORT] },
  // Mazda
  { marca: 'Mazda', modelo: 'Mazda 3', carroceria: 'Hatchback', anio: 2019, version: 'i Touring', precio: 118000, moneda: 'GTQ', km: 61000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'T4X2', color: 'Azul', departamento: 'Escuintla', caracteristicas: [...BASICOS, ...CONFORT] },
  { marca: 'Mazda', modelo: 'CX-5', carroceria: 'SUV', anio: 2022, version: 'Grand Touring', precio: 34000, moneda: 'USD', km: 28000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'AWD', color: 'Rojo', departamento: 'Guatemala', destacado: true, verificado: true, caracteristicas: [...BASICOS, ...CONFORT, ...PREMIUM] },
  // Hyundai
  { marca: 'Hyundai', modelo: 'Tucson', carroceria: 'SUV', anio: 2020, version: 'GLS', precio: 22000, moneda: 'USD', km: 49000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'T4X2', color: 'Plata', departamento: 'Quetzaltenango', verificado: true, caracteristicas: [...BASICOS, ...CONFORT] },
  { marca: 'Hyundai', modelo: 'Accent', carroceria: 'Sedán', anio: 2019, version: 'GL', precio: 98000, moneda: 'GTQ', km: 66000, transmision: 'Manual', combustible: 'Gasolina', traccion: 'T4X2', color: 'Gris', departamento: 'Santa Rosa', caracteristicas: [...BASICOS] },
  // Kia
  { marca: 'Kia', modelo: 'Sportage', carroceria: 'SUV', anio: 2021, version: 'EX', precio: 24000, moneda: 'USD', km: 38000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'T4X2', color: 'Blanco', departamento: 'Chimaltenango', verificado: true, caracteristicas: [...BASICOS, ...CONFORT] },
  { marca: 'Kia', modelo: 'Picanto', carroceria: 'Hatchback', anio: 2022, version: 'LX', precio: 92000, moneda: 'GTQ', km: 19000, transmision: 'Manual', combustible: 'Gasolina', traccion: 'T4X2', color: 'Rojo', departamento: 'Guatemala', caracteristicas: [...BASICOS, 'Bluetooth'] },
  // Suzuki
  { marca: 'Suzuki', modelo: 'Jimny', carroceria: 'SUV', anio: 2021, version: 'GLX', precio: 175000, moneda: 'GTQ', km: 33000, transmision: 'Manual', combustible: 'Gasolina', traccion: 'T4X4', color: 'Verde', departamento: 'Sololá', destacado: true, caracteristicas: [...BASICOS, 'Bluetooth', 'Aros de aluminio'] },
  { marca: 'Suzuki', modelo: 'Swift', carroceria: 'Hatchback', anio: 2020, version: 'GLX', precio: 89000, moneda: 'GTQ', km: 42000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'T4X2', color: 'Azul', departamento: 'Guatemala', caracteristicas: [...BASICOS, 'Bluetooth'] },
  // Chevrolet
  { marca: 'Chevrolet', modelo: 'Colorado', carroceria: 'Pick-up', anio: 2020, version: 'LT', precio: 245000, moneda: 'GTQ', km: 76000, transmision: 'Automática', combustible: 'Diésel', traccion: 'T4X4', color: 'Negro', departamento: 'Jutiapa', verificado: true, caracteristicas: [...BASICOS, ...CONFORT, 'Barras de techo'] },
  { marca: 'Chevrolet', modelo: 'Tracker', carroceria: 'SUV', anio: 2021, version: 'LT', precio: 21000, moneda: 'USD', km: 39000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'T4X2', color: 'Blanco', departamento: 'Guatemala', caracteristicas: [...BASICOS, ...CONFORT] },
  // Ford
  { marca: 'Ford', modelo: 'Ranger', carroceria: 'Pick-up', anio: 2020, version: 'XLT', precio: 255000, moneda: 'GTQ', km: 71000, transmision: 'Automática', combustible: 'Diésel', traccion: 'T4X4', color: 'Azul', departamento: 'San Marcos', verificado: true, caracteristicas: [...BASICOS, ...CONFORT, 'Barras de techo'] },
  { marca: 'Ford', modelo: 'Explorer', carroceria: 'SUV', anio: 2018, version: 'Limited', precio: 29000, moneda: 'USD', km: 83000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'AWD', color: 'Negro', departamento: 'Guatemala', caracteristicas: [...BASICOS, ...CONFORT, ...PREMIUM] },
  // Volkswagen
  { marca: 'Volkswagen', modelo: 'Jetta', carroceria: 'Sedán', anio: 2019, version: 'Comfortline', precio: 135000, moneda: 'GTQ', km: 58000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'T4X2', color: 'Blanco', departamento: 'Guatemala', caracteristicas: [...BASICOS, ...CONFORT] },
  { marca: 'Volkswagen', modelo: 'Tiguan', carroceria: 'SUV', anio: 2021, version: 'Highline', precio: 33000, moneda: 'USD', km: 36000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'AWD', color: 'Gris', departamento: 'Sacatepéquez', destacado: true, verificado: true, caracteristicas: [...BASICOS, ...CONFORT, ...PREMIUM] },
  // Isuzu
  { marca: 'Isuzu', modelo: 'D-Max', carroceria: 'Pick-up', anio: 2020, version: 'LS', precio: 235000, moneda: 'GTQ', km: 82000, transmision: 'Manual', combustible: 'Diésel', traccion: 'T4X4', color: 'Plata', departamento: 'Izabal', verificado: true, caracteristicas: [...BASICOS, 'Cámara de retroceso', 'Barras de techo'] },
  { marca: 'Isuzu', modelo: 'MU-X', carroceria: 'SUV', anio: 2019, version: 'LS-M', precio: 28000, moneda: 'USD', km: 91000, transmision: 'Automática', combustible: 'Diésel', traccion: 'T4X4', color: 'Negro', departamento: 'Guatemala', caracteristicas: [...BASICOS, ...CONFORT] },
  // Mercedes-Benz
  { marca: 'Mercedes-Benz', modelo: 'Clase C', carroceria: 'Sedán', anio: 2018, version: 'C 200', precio: 27000, moneda: 'USD', km: 69000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'T4X2', color: 'Blanco', departamento: 'Guatemala', verificado: true, caracteristicas: [...BASICOS, ...CONFORT, ...PREMIUM] },
  { marca: 'Mercedes-Benz', modelo: 'GLC', carroceria: 'SUV', anio: 2019, version: 'GLC 300', precio: 42000, moneda: 'USD', km: 54000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'AWD', color: 'Gris', departamento: 'Guatemala', destacado: true, verificado: true, caracteristicas: [...BASICOS, ...CONFORT, ...PREMIUM] },
  // BMW
  { marca: 'BMW', modelo: 'Serie 3', carroceria: 'Sedán', anio: 2017, version: '320i', precio: 21000, moneda: 'USD', km: 78000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'T4X2', color: 'Negro', departamento: 'Guatemala', verificado: true, caracteristicas: [...BASICOS, ...CONFORT, ...PREMIUM] },
  { marca: 'BMW', modelo: 'X3', carroceria: 'SUV', anio: 2019, version: 'xDrive30i', precio: 38000, moneda: 'USD', km: 51000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'AWD', color: 'Azul', departamento: 'Guatemala', destacado: true, caracteristicas: [...BASICOS, ...CONFORT, ...PREMIUM] },
  // Audi
  { marca: 'Audi', modelo: 'A4', carroceria: 'Sedán', anio: 2018, version: '2.0 TFSI', precio: 26000, moneda: 'USD', km: 64000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'T4X2', color: 'Plata', departamento: 'Guatemala', verificado: true, caracteristicas: [...BASICOS, ...CONFORT, ...PREMIUM] },
  { marca: 'Audi', modelo: 'Q5', carroceria: 'SUV', anio: 2019, version: '2.0 TFSI Quattro', precio: 41000, moneda: 'USD', km: 48000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'AWD', color: 'Negro', departamento: 'Guatemala', destacado: true, verificado: true, caracteristicas: [...BASICOS, ...CONFORT, ...PREMIUM] },
  // Jeep
  { marca: 'Jeep', modelo: 'Wrangler', carroceria: 'SUV', anio: 2020, version: 'Sport', precio: 39000, moneda: 'USD', km: 44000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'T4X4', color: 'Amarillo', departamento: 'Sacatepéquez', destacado: true, verificado: true, caracteristicas: [...BASICOS, ...CONFORT, 'Barras de techo'] },
  { marca: 'Jeep', modelo: 'Compass', carroceria: 'SUV', anio: 2021, version: 'Limited', precio: 28000, moneda: 'USD', km: 37000, transmision: 'Automática', combustible: 'Gasolina', traccion: 'T4X4', color: 'Rojo', departamento: 'Guatemala', caracteristicas: [...BASICOS, ...CONFORT] },
];

async function main() {
  // 1) Vendedor demo: asegurar existencia + contraseña conocida
  const passwordHash = await argon2.hash(VENDEDOR_PASSWORD);
  const vendedor = await prisma.usuario.upsert({
    where: { email: VENDEDOR_EMAIL },
    update: { passwordHash, rol: 'vendedor', activo: true },
    create: {
      nombre: 'Vendedor Demo',
      email: VENDEDOR_EMAIL,
      passwordHash,
      rol: 'vendedor',
      telefono: '50212345678',
      telefonoVerificado: true,
      emailVerificado: true,
    },
  });

  // 2) Catálogo → mapas por nombre
  const [marcas, carrocerias, transmisiones, combustibles, departamentos, caracteristicas, tc] =
    await Promise.all([
      prisma.marca.findMany({ include: { modelos: true } }),
      prisma.carroceria.findMany(),
      prisma.transmision.findMany(),
      prisma.combustible.findMany(),
      prisma.departamento.findMany({ include: { municipios: true } }),
      prisma.caracteristica.findMany(),
      prisma.tipoCambio.findFirst({ orderBy: { vigenteDesde: 'desc' } }),
    ]);

  const tasa = Number(tc?.tasaUsdGtq ?? 7.8);
  const porNombre = <T extends { nombre: string }>(arr: T[], n: string) =>
    arr.find((x) => x.nombre === n);

  let creados = 0;
  let saltados = 0;
  let conFotos = 0;

  for (let i = 0; i < VEHICULOS.length; i++) {
    const v = VEHICULOS[i];
    const num = String(i + 1).padStart(2, '0');
    const slug = `${slugify(`${v.marca} ${v.modelo} ${v.anio}`)}-demo${num}`;

    // Idempotente: si ya existe lo reusamos (para poder rellenar fotos aparte).
    const existente = await prisma.vehiculo.findUnique({
      where: { slug },
      select: { id: true, _count: { select: { imagenes: true } } },
    });

    let vehiculoId: number;
    if (existente) {
      vehiculoId = existente.id;
      saltados++;
    } else {
      const marca = porNombre(marcas, v.marca);
      const modelo = marca?.modelos.find((m) => m.nombre === v.modelo) ?? marca?.modelos[0];
      const carroceria = porNombre(carrocerias, v.carroceria);
      const transmision = porNombre(transmisiones, v.transmision);
      const combustible = porNombre(combustibles, v.combustible);
      const depto = porNombre(departamentos, v.departamento) ?? departamentos[0];
      const municipio = depto.municipios[0];

      if (!marca || !modelo || !carroceria || !transmision || !combustible || !municipio) {
        console.warn(`  ⚠ salto ${v.marca} ${v.modelo}: falta catálogo`);
        saltados++;
        continue;
      }

      const precioGtq = v.moneda === 'USD' ? Math.round(v.precio * tasa) : v.precio;
      const idsCaract = v.caracteristicas
        .map((n) => porNombre(caracteristicas, n)?.id)
        .filter((x): x is number => x != null);

      const creado = await prisma.vehiculo.create({
        data: {
          slug,
          usuarioId: vendedor.id,
          marcaId: marca.id,
          modeloId: modelo.id,
          carroceriaId: carroceria.id,
          anio: v.anio,
          version: v.version,
          precio: v.precio,
          moneda: v.moneda,
          precioGtq,
          precioNegociable: i % 3 === 0,
          kilometraje: v.km,
          transmisionId: transmision.id,
          combustibleId: combustible.id,
          puertas: v.carroceria === 'Pick-up' ? 4 : v.carroceria === 'Coupé' ? 2 : 4,
          color: v.color,
          traccion: v.traccion,
          numDuenos: (i % 3) + 1,
          descripcion: `${v.marca} ${v.modelo} ${v.anio} ${v.version} en excelente estado. Único dueño, papelería al día, listo para traspaso. Se reciben pruebas de manejo.`,
          departamentoId: depto.id,
          municipioId: municipio.id,
          estado: 'publicado',
          verificado: v.verificado ?? false,
          destacado: v.destacado ?? false,
          publicadoEn: new Date(),
          caracteristicas: idsCaract.length
            ? { createMany: { data: idsCaract.map((caracteristicaId) => ({ caracteristicaId })) } }
            : undefined,
        },
        select: { id: true },
      });
      vehiculoId = creado.id;
      creados++;
    }

    // Fotos placeholder (imagin): solo si el vehículo aún no tiene ninguna.
    if (!existente || existente._count.imagenes === 0) {
      await prisma.vehiculoImagen.createMany({
        data: ANGULOS.map((angle, idx) => ({
          vehiculoId,
          url: imagenUrl(v, angle, 1200),
          urlThumb: imagenUrl(v, angle, 520),
          orden: idx,
          esPrincipal: idx === 0,
        })),
      });
      conFotos++;
    }
  }

  console.log(`\n✅ Vehículos demo: ${creados} creados, ${saltados} reusados.`);
  console.log(`   Fotos placeholder agregadas a ${conFotos} vehículos (${ANGULOS.length} c/u).`);
  console.log(`   Dueño: ${vendedor.nombre} <${VENDEDOR_EMAIL}>  ·  contraseña: ${VENDEDOR_PASSWORD}`);
  console.log(`   Reemplazá las fotos por las reales desde /entrar → "Mis anuncios".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
