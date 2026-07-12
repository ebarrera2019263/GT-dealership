import { type AdminReportesFiltros, adminReportesFiltrosSchema } from '@concesionario/shared';
import { Controller, Get, Ip, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { ReportesService } from './reportes.service';

// Bandeja de denuncias del admin (esquema §5.4).
@Roles('admin')
@Controller('admin/reportes')
export class AdminReportesController {
  constructor(private readonly reportes: ReportesService) {}

  @Get()
  listar(@Query(new ZodValidationPipe(adminReportesFiltrosSchema)) filtros: AdminReportesFiltros) {
    return this.reportes.listarAdmin(filtros);
  }

  @Patch(':id/resolver')
  resolver(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
  ) {
    return this.reportes.resolver(actor, id, ip);
  }
}
