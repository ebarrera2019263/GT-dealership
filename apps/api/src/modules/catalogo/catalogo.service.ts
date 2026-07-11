import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CatalogoService {
  constructor(private readonly prisma: PrismaService) {}

  marcas() {
    return this.prisma.marca.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, slug: true, logoUrl: true },
    });
  }

  modelosDeMarca(marcaId: number) {
    return this.prisma.modelo.findMany({
      where: { marcaId, activo: true },
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, slug: true },
    });
  }

  carrocerias() {
    return this.prisma.carroceria.findMany({
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, slug: true, icono: true },
    });
  }

  combustibles() {
    return this.prisma.combustible.findMany({ orderBy: { nombre: 'asc' } });
  }

  transmisiones() {
    return this.prisma.transmision.findMany({ orderBy: { nombre: 'asc' } });
  }

  caracteristicas() {
    return this.prisma.caracteristica.findMany({
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    });
  }

  departamentos() {
    return this.prisma.departamento.findMany({
      orderBy: { nombre: 'asc' },
      include: { municipios: { orderBy: { nombre: 'asc' } } },
    });
  }
}
