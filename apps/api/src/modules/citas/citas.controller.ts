import { type CitaCrearInput, citaCrearSchema } from '@concesionario/shared';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { CitasService } from './citas.service';

// Autenticado; la propiedad (comprador de la cita / vendedor del anuncio) se
// valida en el servicio.
@Controller('citas')
export class CitasController {
  constructor(private readonly citas: CitasService) {}

  // Visitas que solicité como comprador.
  @Get()
  mias(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.citas.mias(usuario);
  }

  // Visitas recibidas sobre mis anuncios (vendedor).
  @Get('recibidas')
  recibidas(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.citas.recibidas(usuario);
  }

  @Post()
  agendar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body(new ZodValidationPipe(citaCrearSchema)) body: CitaCrearInput,
  ) {
    return this.citas.agendar(usuario, body);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id/confirmar')
  confirmar(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseIntPipe) id: number) {
    return this.citas.confirmar(usuario, id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id/cancelar')
  cancelar(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseIntPipe) id: number) {
    return this.citas.cancelar(usuario, id);
  }
}
