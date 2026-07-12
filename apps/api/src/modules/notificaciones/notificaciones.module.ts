import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NotificacionesProcessor } from './notificaciones.processor';
import { COLA_NOTIFICACIONES, NotificacionesService } from './notificaciones.service';

// La conexión Redis se registra en app.module (BullModule.forRoot). Acá solo
// se declara la cola, el worker y el servicio que la usa.
@Module({
  imports: [BullModule.registerQueue({ name: COLA_NOTIFICACIONES })],
  providers: [NotificacionesService, NotificacionesProcessor],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
