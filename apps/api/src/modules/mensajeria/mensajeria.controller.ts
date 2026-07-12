import {
  type EnviarMensajeInput,
  enviarMensajeSchema,
  type IniciarConversacionInput,
  iniciarConversacionSchema,
} from '@concesionario/shared';
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { MensajeriaService } from './mensajeria.service';

// Sin @Roles: cualquier usuario autenticado participa (comprador o vendedor).
@Controller('conversaciones')
export class MensajeriaController {
  constructor(private readonly mensajeria: MensajeriaService) {}

  @Get()
  mias(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.mensajeria.misConversaciones(usuario);
  }

  @Get('no-leidos')
  noLeidos(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.mensajeria.noLeidos(usuario);
  }

  @Get(':id')
  detalle(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseIntPipe) id: number) {
    return this.mensajeria.detalle(usuario, id);
  }

  @Post()
  iniciar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body(new ZodValidationPipe(iniciarConversacionSchema)) body: IniciarConversacionInput,
  ) {
    return this.mensajeria.iniciar(usuario, body);
  }

  @Post(':id/mensajes')
  enviar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(enviarMensajeSchema)) body: EnviarMensajeInput,
  ) {
    return this.mensajeria.enviar(usuario, id, body);
  }
}
