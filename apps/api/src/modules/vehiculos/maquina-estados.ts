import type { EstadoVehiculo } from '@prisma/client';

/**
 * Máquina de estados del anuncio (esquema §4). Cada transición declara quién
 * puede ejecutarla: el dueño del anuncio, un admin, o el sistema (workers).
 */
export type ActorTransicion = 'dueno' | 'admin' | 'sistema';

export interface Transicion {
  desde: EstadoVehiculo;
  hacia: EstadoVehiculo;
  accion: string;
  actores: ActorTransicion[];
}

export const TRANSICIONES: Transicion[] = [
  { desde: 'borrador', hacia: 'en_revision', accion: 'enviar_revision', actores: ['dueno'] },
  // Tras corregir un rechazo, el vendedor puede reenviar
  { desde: 'rechazado', hacia: 'en_revision', accion: 'enviar_revision', actores: ['dueno'] },
  { desde: 'en_revision', hacia: 'publicado', accion: 'aprobar', actores: ['admin'] },
  { desde: 'en_revision', hacia: 'rechazado', accion: 'rechazar', actores: ['admin'] },
  { desde: 'publicado', hacia: 'pausado', accion: 'pausar', actores: ['dueno'] },
  { desde: 'pausado', hacia: 'publicado', accion: 'reactivar', actores: ['dueno'] },
  { desde: 'publicado', hacia: 'vendido', accion: 'marcar_vendido', actores: ['dueno'] },
  { desde: 'pausado', hacia: 'vendido', accion: 'marcar_vendido', actores: ['dueno'] },
  { desde: 'publicado', hacia: 'expirado', accion: 'expirar', actores: ['sistema'] },
  { desde: 'expirado', hacia: 'en_revision', accion: 'enviar_revision', actores: ['dueno'] },
];

export function buscarTransicion(
  desde: EstadoVehiculo,
  accion: string,
  actor: ActorTransicion,
): Transicion | undefined {
  return TRANSICIONES.find(
    (t) => t.desde === desde && t.accion === accion && t.actores.includes(actor),
  );
}

/** Estados desde los cuales el vendedor todavía puede editar el contenido del anuncio. */
export const ESTADOS_EDITABLES: EstadoVehiculo[] = ['borrador', 'rechazado', 'pausado'];
