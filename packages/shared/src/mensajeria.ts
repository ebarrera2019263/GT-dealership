import { z } from 'zod';

// Mensajería interna desde el MVP (decisión de producto: se adelanta a Fase 1).
// El comprador abre la conversación desde la ficha; ambos intercambian mensajes.

export const iniciarConversacionSchema = z.object({
  vehiculoId: z.number().int().positive(),
  contenido: z.string().trim().min(1, 'Escribí un mensaje').max(2000),
});

export type IniciarConversacionInput = z.infer<typeof iniciarConversacionSchema>;

export const enviarMensajeSchema = z.object({
  contenido: z.string().trim().min(1, 'Escribí un mensaje').max(2000),
});

export type EnviarMensajeInput = z.infer<typeof enviarMensajeSchema>;
