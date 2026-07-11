import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../auth/decorators/roles.decorator';

// Todo /api/admin/* exige rol admin (esquema §5.4). Los KPIs reales llegan en Fase 3.
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('metricas')
  async metricas() {
    const [usuarios, vehiculos, pendientes] = await Promise.all([
      this.prisma.usuario.count(),
      this.prisma.vehiculo.count(),
      this.prisma.vehiculo.count({ where: { estado: 'en_revision' } }),
    ]);
    return { usuarios, vehiculos, pendientesRevision: pendientes };
  }
}
