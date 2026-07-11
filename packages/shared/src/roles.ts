export const ROLES = ['comprador', 'vendedor', 'concesionario', 'admin'] as const;

export type Rol = (typeof ROLES)[number];

export const MONEDAS = ['GTQ', 'USD'] as const;

export type Moneda = (typeof MONEDAS)[number];
