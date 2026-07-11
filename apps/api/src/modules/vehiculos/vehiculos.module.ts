import { Module } from '@nestjs/common';
import { AuditoriaService } from '../../common/auditoria.service';
import { MisVehiculosController } from './mis-vehiculos.controller';
import { VehiculosService } from './vehiculos.service';
import { VehiculosPublicoController } from './vehiculos-publico.controller';

@Module({
  controllers: [VehiculosPublicoController, MisVehiculosController],
  providers: [VehiculosService, AuditoriaService],
  exports: [VehiculosService],
})
export class VehiculosModule {}
