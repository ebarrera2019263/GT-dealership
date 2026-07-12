import {
  type AdminVehiculosFiltros,
  adminVehiculosFiltrosSchema,
  type CambioBooleanoInput,
  cambioBooleanoSchema,
} from '@concesionario/shared';
import { Body, Controller, Get, Ip, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { VehiculosService } from './vehiculos.service';

// Tabla de anuncios del admin (esquema §6, módulo 2) y acciones sueltas de
// verificar/destacar (§5.4). Aprobar/rechazar viven en ModeracionController.
@Roles('admin')
@Controller('admin/vehiculos')
export class AdminVehiculosController {
  constructor(private readonly vehiculos: VehiculosService) {}

  @Get()
  listar(
    @Query(new ZodValidationPipe(adminVehiculosFiltrosSchema)) filtros: AdminVehiculosFiltros,
  ) {
    return this.vehiculos.listarAdmin(filtros);
  }

  @Patch(':id/verificar')
  verificar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(cambioBooleanoSchema)) body: CambioBooleanoInput,
    @Ip() ip: string,
  ) {
    return this.vehiculos.cambiarVerificado(usuario, id, body.valor, ip);
  }

  @Patch(':id/destacar')
  destacar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(cambioBooleanoSchema)) body: CambioBooleanoInput,
    @Ip() ip: string,
  ) {
    return this.vehiculos.cambiarDestacado(usuario, id, body.valor, ip);
  }
}
