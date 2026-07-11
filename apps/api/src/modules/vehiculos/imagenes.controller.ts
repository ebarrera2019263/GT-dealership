import {
  IMAGEN_TAMANO_MAX_BYTES,
  IMAGENES_POR_VEHICULO_MAX,
  type ImagenesReordenarInput,
  imagenesReordenarSchema,
} from '@concesionario/shared';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { ImagenesService } from './imagenes.service';

@Roles('vendedor', 'concesionario', 'admin')
@Controller('mi/vehiculos/:id/imagenes')
export class ImagenesController {
  constructor(private readonly imagenesService: ImagenesService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('imagenes', IMAGENES_POR_VEHICULO_MAX, {
      storage: memoryStorage(),
      limits: { fileSize: IMAGEN_TAMANO_MAX_BYTES, files: IMAGENES_POR_VEHICULO_MAX },
    }),
  )
  subir(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    return this.imagenesService.subir(usuario, id, archivos);
  }

  @Put()
  reordenar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(imagenesReordenarSchema)) body: ImagenesReordenarInput,
  ) {
    return this.imagenesService.reordenar(usuario, id, body);
  }

  @Delete(':imagenId')
  @HttpCode(200)
  eliminar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Param('imagenId', ParseIntPipe) imagenId: number,
  ) {
    return this.imagenesService.eliminar(usuario, id, imagenId);
  }
}
