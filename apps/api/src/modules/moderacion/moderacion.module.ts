import { Module } from '@nestjs/common';
import { VehiculosModule } from '../vehiculos/vehiculos.module';
import { ModeracionController } from './moderacion.controller';

@Module({
  imports: [VehiculosModule],
  controllers: [ModeracionController],
})
export class ModeracionModule {}
