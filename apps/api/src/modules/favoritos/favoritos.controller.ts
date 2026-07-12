import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { FavoritosService } from './favoritos.service';

const agregarSchema = z.object({ vehiculoId: z.number().int().positive() });

// Autenticado; cualquier rol puede tener favoritos.
@Controller('favoritos')
export class FavoritosController {
  constructor(private readonly favoritos: FavoritosService) {}

  @Get()
  lista(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.favoritos.lista(usuario);
  }

  @Get('ids')
  ids(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.favoritos.ids(usuario);
  }

  @Post()
  agregar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body(new ZodValidationPipe(agregarSchema)) body: { vehiculoId: number },
  ) {
    return this.favoritos.agregar(usuario, body.vehiculoId);
  }

  @Delete(':vehiculoId')
  quitar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('vehiculoId', ParseIntPipe) vehiculoId: number,
  ) {
    return this.favoritos.quitar(usuario, vehiculoId);
  }
}
