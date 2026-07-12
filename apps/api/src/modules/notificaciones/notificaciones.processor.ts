import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { createTransport, type Transporter } from 'nodemailer';
import { env } from '../../config/env';
import { COLA_NOTIFICACIONES, type EmailJob } from './notificaciones.service';

// Worker de la cola: envía el correo por SMTP si está configurado; si no, lo
// registra en log (dev / sin proveedor todavía). Corre en el mismo proceso.
@Processor(COLA_NOTIFICACIONES)
export class NotificacionesProcessor extends WorkerHost {
  private readonly log = new Logger('Notificaciones');
  private transporte: Transporter | null = null;

  private get mailer(): Transporter | null {
    if (!env.SMTP_URL) return null;
    if (!this.transporte) {
      this.transporte = createTransport(env.SMTP_URL);
    }
    return this.transporte;
  }

  async process(job: Job<EmailJob>): Promise<void> {
    const { para, asunto, cuerpo } = job.data;
    const mailer = this.mailer;

    if (!mailer) {
      // Sin SMTP: dejamos rastro para no perder el aviso en dev.
      this.log.log(`[email:log] → ${para} · ${asunto}`);
      return;
    }

    await mailer.sendMail({ from: env.EMAIL_FROM, to: para, subject: asunto, text: cuerpo });
    this.log.log(`[email:enviado] → ${para} · ${asunto}`);
  }
}
