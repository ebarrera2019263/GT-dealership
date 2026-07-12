import { Module } from '@nestjs/common';
import { VehiculosModule } from '../vehiculos/vehiculos.module';
import { BusquedasController } from './busquedas.controller';
import { BusquedasService } from './busquedas.service';

@Module({
  imports: [VehiculosModule],
  controllers: [BusquedasController],
  providers: [BusquedasService],
})
export class BusquedasModule {}
