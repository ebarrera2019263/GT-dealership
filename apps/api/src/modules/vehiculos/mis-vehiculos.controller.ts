import {
  type VehiculoActualizarInput,
  type VehiculoCrearInput,
  vehiculoActualizarSchema,
  vehiculoCrearSchema,
} from '@concesionario/shared';
import { Body, Controller, Get, Ip, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { VehiculosService } from './vehiculos.service';

// Publicar es de vendedores (esquema §2); un comprador que quiere vender
// cambia de rol desde su perfil (Fase 2).
@Roles('vendedor', 'concesionario', 'admin')
@Controller('mi/vehiculos')
export class MisVehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get()
  misVehiculos(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.vehiculosService.misVehiculos(usuario);
  }

  @Get(':id')
  obtener(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.paraEdicion(usuario, id);
  }

  @Post()
  crear(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body(new ZodValidationPipe(vehiculoCrearSchema)) body: VehiculoCrearInput,
  ) {
    return this.vehiculosService.crear(usuario, body);
  }

  @Put(':id')
  actualizar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(vehiculoActualizarSchema)) body: VehiculoActualizarInput,
  ) {
    return this.vehiculosService.actualizar(usuario, id, body);
  }

  @Post(':id/publicar')
  publicar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.transicionar(usuario, id, 'enviar_revision', { ip });
  }

  @Post(':id/pausar')
  pausar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.transicionar(usuario, id, 'pausar', { ip });
  }

  @Post(':id/reactivar')
  reactivar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.transicionar(usuario, id, 'reactivar', { ip });
  }

  @Post(':id/vendido')
  vendido(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.transicionar(usuario, id, 'marcar_vendido', { ip });
  }
}
