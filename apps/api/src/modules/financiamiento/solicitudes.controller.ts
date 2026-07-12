import {
  type SolicitudCreditoCrearInput,
  solicitudCreditoCrearSchema,
} from '@concesionario/shared';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { SolicitudesService } from './solicitudes.service';

// Solicitar financiamiento requiere cuenta (queda ligada al usuario).
@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudes: SolicitudesService) {}

  @Post()
  crear(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body(new ZodValidationPipe(solicitudCreditoCrearSchema)) body: SolicitudCreditoCrearInput,
  ) {
    return this.solicitudes.crear(usuario, body);
  }

  @Get('mias')
  mias(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.solicitudes.misSolicitudes(usuario.id);
  }
}
