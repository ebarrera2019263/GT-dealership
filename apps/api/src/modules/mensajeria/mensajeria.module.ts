import { Module } from '@nestjs/common';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { MensajeriaController } from './mensajeria.controller';
import { MensajeriaService } from './mensajeria.service';

@Module({
  imports: [NotificacionesModule],
  controllers: [MensajeriaController],
  providers: [MensajeriaService],
})
export class MensajeriaModule {}
