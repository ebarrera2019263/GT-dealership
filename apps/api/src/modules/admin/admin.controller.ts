import { type AdminAuditoriaFiltros, adminAuditoriaFiltrosSchema } from '@concesionario/shared';
import { Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

// Todo /api/admin/* exige rol admin (esquema §5.4).
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('metricas')
  metricas() {
    return this.admin.metricas();
  }

  @Get('auditoria')
  auditoria(
    @Query(new ZodValidationPipe(adminAuditoriaFiltrosSchema)) filtros: AdminAuditoriaFiltros,
  ) {
    return this.admin.auditoria(filtros);
  }
}
