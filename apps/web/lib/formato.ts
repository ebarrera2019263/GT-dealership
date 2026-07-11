// Formateo de datos del dominio para la UI. Guatemala: es-GT, quetzales primero.

export function formatearPrecio(monto: string | number, moneda: 'GTQ' | 'USD'): string {
  const simbolo = moneda === 'GTQ' ? 'Q' : 'US$';
  const valor = Number(monto);
  return `${simbolo}${valor.toLocaleString('es-GT', { maximumFractionDigits: 0 })}`;
}

export function formatearKm(km: number): string {
  return `${km.toLocaleString('es-GT')} km`;
}

// El API habla el enum de Prisma (T4X4); la UI habla como la gente
const TRACCION_LEGIBLE: Record<string, string> = {
  T4X2: '4x2',
  T4X4: '4x4',
  AWD: 'AWD',
};

export function traccionLegible(traccion: string | null): string | null {
  return traccion ? (TRACCION_LEGIBLE[traccion] ?? traccion) : null;
}
