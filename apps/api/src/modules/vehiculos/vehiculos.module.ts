import { Module } from '@nestjs/common';
import { AuditoriaService } from '../../common/auditoria.service';
import { ImagenesController } from './imagenes.controller';
import { ImagenesService } from './imagenes.service';
import { MisVehiculosController } from './mis-vehiculos.controller';
import { VehiculosService } from './vehiculos.service';
import { VehiculosPublicoController } from './vehiculos-publico.controller';

@Module({
  controllers: [VehiculosPublicoController, MisVehiculosController, ImagenesController],
  providers: [VehiculosService, ImagenesService, AuditoriaService],
  exports: [VehiculosService],
})
export class VehiculosModule {}
