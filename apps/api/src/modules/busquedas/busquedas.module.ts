import { Module } from '@nestjs/common';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { VehiculosModule } from '../vehiculos/vehiculos.module';
import { BusquedasController } from './busquedas.controller';
import { BusquedasService } from './busquedas.service';

@Module({
  imports: [VehiculosModule, NotificacionesModule],
  controllers: [BusquedasController],
  providers: [BusquedasService],
})
export class BusquedasModule {}
