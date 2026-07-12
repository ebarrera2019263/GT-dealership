import type { AdminAuditoriaFiltros } from '@concesionario/shared';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// KPIs del dashboard admin (esquema §6, módulo 1). Un solo endpoint agrega los
// conteos, el top de marcas y la serie mensual de publicaciones.
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async metricas() {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    // Serie de los últimos 6 meses (incluye el actual), arrancando el día 1.
    const desdeSerie = new Date(inicioMes);
    desdeSerie.setMonth(desdeSerie.getMonth() - 5);

    const [activos, pendientes, vendidos, usuarios, leadsMes, topGrupos, publicados] =
      await Promise.all([
        this.prisma.vehiculo.count({ where: { estado: 'publicado' } }),
        this.prisma.vehiculo.count({ where: { estado: 'en_revision' } }),
        this.prisma.vehiculo.count({ where: { estado: 'vendido' } }),
        this.prisma.usuario.count(),
        this.prisma.lead.count({ where: { creadoEn: { gte: inicioMes } } }),
        this.prisma.vehiculo.groupBy({
          by: ['marcaId'],
          where: { estado: 'publicado' },
          _count: { _all: true },
          orderBy: { _count: { marcaId: 'desc' } },
          take: 5,
        }),
        this.prisma.vehiculo.findMany({
          where: { publicadoEn: { gte: desdeSerie } },
          select: { publicadoEn: true },
        }),
      ]);

    // Nombres de las marcas top (groupBy solo devuelve el id).
    const marcas = await this.prisma.marca.findMany({
      where: { id: { in: topGrupos.map((g) => g.marcaId) } },
      select: { id: true, nombre: true },
    });
    const nombreMarca = new Map(marcas.map((m) => [m.id, m.nombre]));
    const topMarcas = topGrupos.map((g) => ({
      nombre: nombreMarca.get(g.marcaId) ?? '—',
      total: g._count._all,
    }));

    return {
      activos,
      pendientes,
      vendidos,
      usuarios,
      leadsMes,
      topMarcas,
      publicacionesPorMes: this.serieMensual(publicados, desdeSerie),
    };
  }

  /** Agrupa fechas de publicación en 6 buckets mensuales consecutivos (con ceros). */
  private serieMensual(filas: { publicadoEn: Date | null }[], desde: Date) {
    const clave = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const conteo = new Map<string, number>();
    for (const { publicadoEn } of filas) {
      if (!publicadoEn) continue;
      const k = clave(publicadoEn);
      conteo.set(k, (conteo.get(k) ?? 0) + 1);
    }

    const serie: { mes: string; total: number }[] = [];
    const cursor = new Date(desde);
    for (let i = 0; i < 6; i++) {
      const k = clave(cursor);
      serie.push({ mes: k, total: conteo.get(k) ?? 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return serie;
  }

  // ─────────────── Auditoría (esquema §3.7, §6 módulo 10) ───────────────

  /** Registro de quién hizo qué, filtrable por entidad, acción o autor. */
  async auditoria(filtros: AdminAuditoriaFiltros) {
    const where: Prisma.AuditoriaWhereInput = {
      entidad: filtros.entidad,
      accion: filtros.accion,
      usuarioId: filtros.usuarioId,
    };

    const registros = await this.prisma.auditoria.findMany({
      where,
      orderBy: { id: 'desc' },
      take: filtros.limite + 1,
      ...(filtros.cursor ? { cursor: { id: filtros.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        accion: true,
        entidad: true,
        entidadId: true,
        datosAntes: true,
        datosDespues: true,
        ip: true,
        creadoEn: true,
        usuario: { select: { id: true, nombre: true, email: true } },
      },
    });

    const hayMas = registros.length > filtros.limite;
    const pagina = hayMas ? registros.slice(0, filtros.limite) : registros;
    return {
      resultados: pagina,
      siguienteCursor: hayMas ? pagina[pagina.length - 1]?.id : null,
    };
  }
}
