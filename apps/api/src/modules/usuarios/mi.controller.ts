import { type PerfilUpdateInput, perfilUpdateSchema } from '@concesionario/shared';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { UsuariosService } from './usuarios.service';

@Controller('mi')
export class MiController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('perfil')
  perfil(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.usuariosService.obtenerPerfil(usuario.id);
  }

  @Put('perfil')
  actualizar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body(new ZodValidationPipe(perfilUpdateSchema)) body: PerfilUpdateInput,
  ) {
    return this.usuariosService.actualizarPerfil(usuario.id, body);
  }
}
