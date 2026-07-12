import {
  type AdminSolicitudesFiltros,
  adminSolicitudesFiltrosSchema,
  type SolicitudEstadoInput,
  solicitudEstadoSchema,
} from '@concesionario/shared';
import { Body, Controller, Get, Ip, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { SolicitudesService } from './solicitudes.service';

// Bandeja de solicitudes de crédito del admin (esquema §5.4).
@Roles('admin')
@Controller('admin/solicitudes-credito')
export class AdminSolicitudesController {
  constructor(private readonly solicitudes: SolicitudesService) {}

  @Get()
  listar(
    @Query(new ZodValidationPipe(adminSolicitudesFiltrosSchema)) filtros: AdminSolicitudesFiltros,
  ) {
    return this.solicitudes.listarAdmin(filtros);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(solicitudEstadoSchema)) body: SolicitudEstadoInput,
    @Ip() ip: string,
  ) {
    return this.solicitudes.cambiarEstado(actor, id, body.estado, ip);
  }
}
