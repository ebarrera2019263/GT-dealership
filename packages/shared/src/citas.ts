import { z } from 'zod';

// Estados de una cita/visita (esquema §4, tabla `citas`).
export const ESTADOS_CITA = ['pendiente', 'confirmada', 'cancelada'] as const;
export type EstadoCita = (typeof ESTADOS_CITA)[number];

// Agendar una visita para un vehículo publicado. La fecha llega como ISO string
// y debe ser futura; la validación del server es la que manda (la del form es
// cortesía).
export const citaCrearSchema = z.object({
  vehiculoId: z.coerce.number().int().positive(),
  fecha: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
    message: 'La fecha de la visita debe ser futura',
  }),
});

export type CitaCrearInput = z.infer<typeof citaCrearSchema>;
