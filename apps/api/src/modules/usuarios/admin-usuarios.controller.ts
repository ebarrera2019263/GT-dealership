import {
  type AdminUsuariosFiltros,
  adminUsuariosFiltrosSchema,
  type CambiarRolInput,
  type CambioBooleanoInput,
  cambiarRolSchema,
  cambioBooleanoSchema,
} from '@concesionario/shared';
import { Body, Controller, Get, Ip, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { UsuariosService } from './usuarios.service';

// Gestión de usuarios del admin (esquema §5.4, §6 módulo 7).
@Roles('admin')
@Controller('admin/usuarios')
export class AdminUsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get()
  listar(@Query(new ZodValidationPipe(adminUsuariosFiltrosSchema)) filtros: AdminUsuariosFiltros) {
    return this.usuarios.listarAdmin(filtros);
  }

  @Patch(':id/rol')
  cambiarRol(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(cambiarRolSchema)) body: CambiarRolInput,
    @Ip() ip: string,
  ) {
    return this.usuarios.cambiarRol(actor, id, body.rol, ip);
  }

  @Patch(':id/activo')
  cambiarActivo(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(cambioBooleanoSchema)) body: CambioBooleanoInput,
    @Ip() ip: string,
  ) {
    return this.usuarios.cambiarActivo(actor, id, body.valor, ip);
  }
}
