import { type ModeracionInput, moderacionSchema } from '@concesionario/shared';
import { Body, Controller, Get, Ip, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { PrismaService } from '../../prisma/prisma.service';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { VehiculosService } from '../vehiculos/vehiculos.service';

@Roles('admin')
@Controller('admin')
export class ModeracionController {
  constructor(
    private readonly vehiculosService: VehiculosService,
    private readonly prisma: PrismaService,
  ) {}

  // Cola de revisión (esquema §6, módulo 4): primero en enviar, primero en revisarse
  @Get('moderacion/pendientes')
  pendientes() {
    return this.prisma.vehiculo.findMany({
      where: { estado: 'en_revision' },
      orderBy: { actualizadoEn: 'asc' },
      include: {
        usuario: { select: { id: true, nombre: true, email: true, telefonoVerificado: true } },
        marca: { select: { nombre: true } },
        modelo: { select: { nombre: true } },
        imagenes: { orderBy: { orden: 'asc' } },
      },
    });
  }

  @Patch('vehiculos/:id/estado')
  moderar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(moderacionSchema)) body: ModeracionInput,
    @Ip() ip: string,
  ) {
    const accion = body.accion === 'aprobar' ? 'aprobar' : 'rechazar';
    const motivo = body.accion === 'rechazar' ? body.motivo : undefined;
    return this.vehiculosService.transicionar(usuario, id, accion, { motivo, ip });
  }
}
