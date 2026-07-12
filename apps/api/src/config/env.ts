import 'dotenv/config';
import { z } from 'zod';

// El proceso no arranca con configuración inválida: fallar acá es más barato
// que fallar en el primer request.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET debe tener al menos 16 caracteres'),
  JWT_ACCESS_TTL_MIN: z.coerce.number().int().positive().default(15),
  JWT_REFRESH_TTL_DIAS: z.coerce.number().int().positive().default(30),
  PORT: z.coerce.number().int().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  // Almacenamiento de imágenes: disco local en el MVP (esquema §7 sugiere S3
  // en producción; el service abstrae la escritura para migrar sin tocar la API).
  UPLOAD_DIR: z.string().min(1).default('uploads'),
  // Prefijo público para servir los archivos. Debe apuntar al mismo host que
  // sirve /uploads (el API en dev; un CDN/bucket en prod).
  PUBLIC_URL: z.string().url().default('http://localhost:3001'),
  // Envío de correos (leads, mensajes, alertas). Sin SMTP_URL, el worker de
  // notificaciones solo registra en log — útil en dev y sin proveedor todavía.
  SMTP_URL: z.string().url().optional(),
  EMAIL_FROM: z.string().default('AutosGT <no-reply@autosgt.local>'),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
