import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';

export const COLA_NOTIFICACIONES = 'notificaciones';

export interface EmailJob {
  para: string;
  asunto: string;
  cuerpo: string;
}

// Encola correos; el envío real lo hace el worker (notificaciones.processor).
// Construir el contenido acá mantiene el worker tonto (solo envía).
@Injectable()
export class NotificacionesService {
  constructor(@InjectQueue(COLA_NOTIFICACIONES) private readonly cola: Queue<EmailJob>) {}

  private encolar(job: EmailJob) {
    // Reintentos con backoff; los jobs viejos se limpian solos.
    return this.cola.add('email', job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    });
  }

  nuevoLead(para: string, anuncio: string, contacto: { nombre: string; medio: string }) {
    return this.encolar({
      para,
      asunto: `Nuevo interesado en tu ${anuncio}`,
      cuerpo: `${contacto.nombre} quiere contactarte por tu anuncio "${anuncio}".\nMedio de contacto: ${contacto.medio}.\n\nRespondé pronto para no perder la venta.`,
    });
  }

  nuevoMensaje(para: string, anuncio: string, deQuien: string) {
    return this.encolar({
      para,
      asunto: `Nuevo mensaje sobre tu ${anuncio}`,
      cuerpo: `${deQuien} te escribió por el anuncio "${anuncio}". Entrá a tus mensajes para responder.`,
    });
  }

  alertaBusqueda(para: string, resumen: string, cantidad: number) {
    return this.encolar({
      para,
      asunto: `${cantidad} vehículo(s) nuevo(s) para tu búsqueda guardada`,
      cuerpo: `Aparecieron ${cantidad} anuncio(s) nuevo(s) que coinciden con tu búsqueda (${resumen}). Entrá para verlos.`,
    });
  }
}
