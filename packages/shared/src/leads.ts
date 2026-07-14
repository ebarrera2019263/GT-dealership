import { z } from 'zod';

export const CANALES_LEAD = ['formulario', 'whatsapp', 'llamada'] as const;
export type CanalLeadStr = (typeof CANALES_LEAD)[number];

// Contacto sin necesidad de cuenta (esquema §5.1): al menos un medio de contacto.
export const leadCrearSchema = z
  .object({
    vehiculoId: z.number().int().positive(),
    nombre: z.string().trim().min(2, 'Ingresá tu nombre').max(120),
    telefono: z
      .string()
      .regex(/^\+?\d{8,15}$/, 'Teléfono inválido')
      .optional(),
    email: z.email('Email inválido').optional(),
    canal: z.enum(CANALES_LEAD).default('formulario'),
  })
  .refine((d) => d.telefono || d.email, {
    message: 'Indicá un teléfono o un email de contacto',
    path: ['telefono'],
  });

export type LeadCrearInput = z.infer<typeof leadCrearSchema>;
