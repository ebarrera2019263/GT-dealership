import {
  type EntidadFinancieraActualizarInput,
  type EntidadFinancieraCrearInput,
  entidadFinancieraActualizarSchema,
  entidadFinancieraCrearSchema,
  type PlanFinanciamientoActualizarInput,
  type PlanFinanciamientoCrearInput,
  planFinanciamientoActualizarSchema,
  planFinanciamientoCrearSchema,
} from '@concesionario/shared';
import { Body, Controller, Get, Ip, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { FinanciamientoAdminService } from './financiamiento-admin.service';

// Config de financiamiento (esquema §5.4, §6 módulo 6). Baja lógica vía activo.
@Roles('admin')
@Controller('admin/financiamiento')
export class AdminFinanciamientoController {
  constructor(private readonly financiamiento: FinanciamientoAdminService) {}

  @Get('entidades')
  listarEntidades() {
    return this.financiamiento.listarEntidades();
  }

  @Post('entidades')
  crearEntidad(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Body(new ZodValidationPipe(entidadFinancieraCrearSchema)) body: EntidadFinancieraCrearInput,
    @Ip() ip: string,
  ) {
    return this.financiamiento.crearEntidad(actor, body, ip);
  }

  @Patch('entidades/:id')
  actualizarEntidad(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(entidadFinancieraActualizarSchema))
    body: EntidadFinancieraActualizarInput,
    @Ip() ip: string,
  ) {
    return this.financiamiento.actualizarEntidad(actor, id, body, ip);
  }

  @Get('planes')
  listarPlanes(@Query('entidadId') entidadId?: string) {
    return this.financiamiento.listarPlanes(entidadId ? Number(entidadId) : undefined);
  }

  @Post('planes')
  crearPlan(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Body(new ZodValidationPipe(planFinanciamientoCrearSchema)) body: PlanFinanciamientoCrearInput,
    @Ip() ip: string,
  ) {
    return this.financiamiento.crearPlan(actor, body, ip);
  }

  @Patch('planes/:id')
  actualizarPlan(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(planFinanciamientoActualizarSchema))
    body: PlanFinanciamientoActualizarInput,
    @Ip() ip: string,
  ) {
    return this.financiamiento.actualizarPlan(actor, id, body, ip);
  }
}
