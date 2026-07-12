import {
  type CaracteristicaActualizarInput,
  type CaracteristicaCrearInput,
  type CarroceriaActualizarInput,
  type CarroceriaCrearInput,
  type CombustibleActualizarInput,
  type CombustibleCrearInput,
  caracteristicaActualizarSchema,
  caracteristicaCrearSchema,
  carroceriaActualizarSchema,
  carroceriaCrearSchema,
  combustibleActualizarSchema,
  combustibleCrearSchema,
  type MarcaActualizarInput,
  type MarcaCrearInput,
  type ModeloActualizarInput,
  type ModeloCrearInput,
  marcaActualizarSchema,
  marcaCrearSchema,
  modeloActualizarSchema,
  modeloCrearSchema,
} from '@concesionario/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { AdminCatalogoService } from './admin-catalogo.service';

// ABM del catálogo maestro (esquema §5.4, §6 módulo 5). Marcas y modelos usan
// baja lógica (activo), así que no hay DELETE.
@Roles('admin')
@Controller('admin/catalogo')
export class AdminCatalogoController {
  constructor(private readonly catalogo: AdminCatalogoService) {}

  @Get('marcas')
  listarMarcas() {
    return this.catalogo.listarMarcas();
  }

  @Post('marcas')
  crearMarca(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Body(new ZodValidationPipe(marcaCrearSchema)) body: MarcaCrearInput,
    @Ip() ip: string,
  ) {
    return this.catalogo.crearMarca(actor, body, ip);
  }

  @Patch('marcas/:id')
  actualizarMarca(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(marcaActualizarSchema)) body: MarcaActualizarInput,
    @Ip() ip: string,
  ) {
    return this.catalogo.actualizarMarca(actor, id, body, ip);
  }

  @Get('marcas/:marcaId/modelos')
  listarModelos(@Param('marcaId', ParseIntPipe) marcaId: number) {
    return this.catalogo.listarModelos(marcaId);
  }

  @Post('marcas/:marcaId/modelos')
  crearModelo(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('marcaId', ParseIntPipe) marcaId: number,
    @Body(new ZodValidationPipe(modeloCrearSchema)) body: ModeloCrearInput,
    @Ip() ip: string,
  ) {
    return this.catalogo.crearModelo(actor, marcaId, body, ip);
  }

  @Patch('modelos/:id')
  actualizarModelo(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(modeloActualizarSchema)) body: ModeloActualizarInput,
    @Ip() ip: string,
  ) {
    return this.catalogo.actualizarModelo(actor, id, body, ip);
  }

  // ─────────────── Carrocerías ───────────────

  @Get('carrocerias')
  listarCarrocerias() {
    return this.catalogo.listarCarrocerias();
  }

  @Post('carrocerias')
  crearCarroceria(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Body(new ZodValidationPipe(carroceriaCrearSchema)) body: CarroceriaCrearInput,
    @Ip() ip: string,
  ) {
    return this.catalogo.crearCarroceria(actor, body, ip);
  }

  @Patch('carrocerias/:id')
  actualizarCarroceria(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(carroceriaActualizarSchema)) body: CarroceriaActualizarInput,
    @Ip() ip: string,
  ) {
    return this.catalogo.actualizarCarroceria(actor, id, body, ip);
  }

  @Delete('carrocerias/:id')
  eliminarCarroceria(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
  ) {
    return this.catalogo.eliminarCarroceria(actor, id, ip);
  }

  // ─────────────── Combustibles ───────────────

  @Get('combustibles')
  listarCombustibles() {
    return this.catalogo.listarCombustibles();
  }

  @Post('combustibles')
  crearCombustible(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Body(new ZodValidationPipe(combustibleCrearSchema)) body: CombustibleCrearInput,
    @Ip() ip: string,
  ) {
    return this.catalogo.crearCombustible(actor, body, ip);
  }

  @Patch('combustibles/:id')
  actualizarCombustible(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(combustibleActualizarSchema)) body: CombustibleActualizarInput,
    @Ip() ip: string,
  ) {
    return this.catalogo.actualizarCombustible(actor, id, body, ip);
  }

  @Delete('combustibles/:id')
  eliminarCombustible(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
  ) {
    return this.catalogo.eliminarCombustible(actor, id, ip);
  }

  // ─────────────── Características ───────────────

  @Get('caracteristicas')
  listarCaracteristicas() {
    return this.catalogo.listarCaracteristicas();
  }

  @Post('caracteristicas')
  crearCaracteristica(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Body(new ZodValidationPipe(caracteristicaCrearSchema)) body: CaracteristicaCrearInput,
    @Ip() ip: string,
  ) {
    return this.catalogo.crearCaracteristica(actor, body, ip);
  }

  @Patch('caracteristicas/:id')
  actualizarCaracteristica(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(caracteristicaActualizarSchema))
    body: CaracteristicaActualizarInput,
    @Ip() ip: string,
  ) {
    return this.catalogo.actualizarCaracteristica(actor, id, body, ip);
  }

  @Delete('caracteristicas/:id')
  eliminarCaracteristica(
    @UsuarioActual() actor: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
  ) {
    return this.catalogo.eliminarCaracteristica(actor, id, ip);
  }
}
