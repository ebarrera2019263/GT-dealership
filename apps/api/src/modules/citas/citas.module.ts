import { Module } from '@nestjs/common';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';

@Module({
  imports: [NotificacionesModule],
  controllers: [CitasController],
  providers: [CitasService],
})
export class CitasModule {}
