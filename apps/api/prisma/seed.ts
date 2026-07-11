import { PrismaClient } from '@prisma/client';
import {
  CARACTERISTICAS,
  CARROCERIAS,
  COMBUSTIBLES,
  MARCAS_CON_MODELOS,
  TASA_USD_GTQ_INICIAL,
  TRANSMISIONES,
} from './seeds/catalogo';
import { DEPARTAMENTOS } from './seeds/ubicaciones';

const prisma = new PrismaClient();

// Idempotente: correrlo dos veces no duplica nada (upsert por claves únicas).
async function main() {
  await seedMarcasYModelos();
  await seedSimples();
  await seedCaracteristicas();
  await seedUbicaciones();
  await seedTipoCambio();
  console.log('Seed del catálogo maestro completado.');
}

function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedMarcasYModelos() {
  for (const [nombreMarca, modelos] of Object.entries(MARCAS_CON_MODELOS)) {
    const marca = await prisma.marca.upsert({
      where: { slug: slugify(nombreMarca) },
      update: {},
      create: { nombre: nombreMarca, slug: slugify(nombreMarca) },
    });
    for (const nombreModelo of modelos) {
      const slug = slugify(nombreModelo);
      await prisma.modelo.upsert({
        where: { marcaId_slug: { marcaId: marca.id, slug } },
        update: {},
        create: { marcaId: marca.id, nombre: nombreModelo, slug },
      });
    }
  }
  console.log(`  marcas y modelos: ${Object.keys(MARCAS_CON_MODELOS).length} marcas`);
}

async function seedSimples() {
  for (const nombre of CARROCERIAS) {
    await prisma.carroceria.upsert({
      where: { nombre },
      update: {},
      create: { nombre, slug: slugify(nombre) },
    });
  }
  for (const nombre of COMBUSTIBLES) {
    await prisma.combustible.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  for (const nombre of TRANSMISIONES) {
    await prisma.transmision.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  console.log('  carrocerías, combustibles y transmisiones');
}

async function seedCaracteristicas() {
  for (const [categoria, nombres] of Object.entries(CARACTERISTICAS)) {
    for (const nombre of nombres) {
      await prisma.caracteristica.upsert({
        where: { nombre },
        update: { categoria },
        create: { nombre, categoria },
      });
    }
  }
  console.log('  características');
}

async function seedUbicaciones() {
  for (const [nombreDepto, municipios] of Object.entries(DEPARTAMENTOS)) {
    const departamento = await prisma.departamento.upsert({
      where: { nombre: nombreDepto },
      update: {},
      create: { nombre: nombreDepto },
    });
    for (const nombre of municipios) {
      await prisma.municipio.upsert({
        where: { departamentoId_nombre: { departamentoId: departamento.id, nombre } },
        update: {},
        create: { departamentoId: departamento.id, nombre },
      });
    }
  }
  console.log(`  ubicaciones: ${Object.keys(DEPARTAMENTOS).length} departamentos`);
}

async function seedTipoCambio() {
  const existe = await prisma.tipoCambio.findFirst();
  if (!existe) {
    await prisma.tipoCambio.create({
      data: { tasaUsdGtq: TASA_USD_GTQ_INICIAL, vigenteDesde: new Date() },
    });
    console.log(`  tipo de cambio inicial: ${TASA_USD_GTQ_INICIAL} GTQ/USD`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
