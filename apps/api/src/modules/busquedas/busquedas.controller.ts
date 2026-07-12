import {
  type BusquedaActualizarInput,
  type BusquedaCrearInput,
  busquedaActualizarSchema,
  busquedaCrearSchema,
} from '@concesionario/shared';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { BusquedasService } from './busquedas.service';

// Autenticado; cualquier rol puede guardar búsquedas.
@Controller('busquedas')
export class BusquedasController {
  constructor(private readonly busquedas: BusquedasService) {}

  @Get()
  lista(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.busquedas.lista(usuario);
  }

  @Post()
  crear(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body(new ZodValidationPipe(busquedaCrearSchema)) body: BusquedaCrearInput,
  ) {
    return this.busquedas.crear(usuario, body);
  }

  @Patch(':id')
  actualizar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(busquedaActualizarSchema)) body: BusquedaActualizarInput,
  ) {
    return this.busquedas.actualizar(usuario, id, body);
  }

  @Post(':id/visto')
  marcarVisto(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseIntPipe) id: number) {
    return this.busquedas.marcarVisto(usuario, id);
  }

  @Delete(':id')
  eliminar(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseIntPipe) id: number) {
    return this.busquedas.eliminar(usuario, id);
  }
}
