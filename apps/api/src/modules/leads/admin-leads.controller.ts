import { type AdminLeadsFiltros, adminLeadsFiltrosSchema } from '@concesionario/shared';
import { Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { LeadsService } from './leads.service';

// Contactos recibidos, para el admin (esquema §5.4).
@Roles('admin')
@Controller('admin/leads')
export class AdminLeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  listar(@Query(new ZodValidationPipe(adminLeadsFiltrosSchema)) filtros: AdminLeadsFiltros) {
    return this.leads.listarAdmin(filtros);
  }
}
