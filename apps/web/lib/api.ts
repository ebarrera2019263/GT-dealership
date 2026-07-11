// Cliente HTTP del lado del servidor. Los tipos espejan lo que devuelve el API;
// cuando crezcan, se mueven a @concesionario/shared.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface NombreSlug {
  id?: number;
  nombre: string;
  slug?: string;
}

export interface VehiculoResumen {
  id: number;
  slug: string;
  anio: number;
  version: string | null;
  precio: string;
  moneda: 'GTQ' | 'USD';
  precioGtq: string;
  kilometraje: number;
  destacado: boolean;
  verificado: boolean;
  publicadoEn: string | null;
  marca: NombreSlug;
  modelo: NombreSlug;
  carroceria: NombreSlug;
  transmision: NombreSlug;
  combustible: NombreSlug;
  departamento: NombreSlug;
  imagenes: { url: string; urlThumb: string | null }[];
}

export interface VehiculoFicha extends Omit<VehiculoResumen, 'imagenes'> {
  cilindrada: string | null;
  potencia: number | null;
  puertas: number | null;
  color: string | null;
  traccion: string | null;
  numDuenos: number | null;
  descripcion: string | null;
  precioNegociable: boolean;
  vistas: number;
  municipio: NombreSlug;
  imagenes: { id: number; url: string; urlThumb: string | null; esPrincipal: boolean }[];
  caracteristicas: { caracteristica: { id: number; nombre: string; categoria: string } }[];
  usuario: { id: number; nombre: string; telefonoVerificado: boolean; creadoEn: string };
}

export interface ListadoRespuesta {
  resultados: VehiculoResumen[];
  siguienteCursor: number | null;
}

export interface Marca {
  id: number;
  nombre: string;
  slug: string;
}

async function get<T>(ruta: string, revalidarSegundos = 60): Promise<T> {
  const res = await fetch(`${API_URL}${ruta}`, { next: { revalidate: revalidarSegundos } });
  if (!res.ok) {
    throw new Error(`API ${res.status} en ${ruta}`);
  }
  return res.json() as Promise<T>;
}

export function listarVehiculos(params: URLSearchParams): Promise<ListadoRespuesta> {
  const qs = params.toString();
  // El listado cambia seguido: revalidación corta
  return get<ListadoRespuesta>(`/vehiculos${qs ? `?${qs}` : ''}`, 30);
}

export function obtenerFicha(slug: string): Promise<VehiculoFicha | null> {
  return get<VehiculoFicha>(`/vehiculos/${slug}`, 60).catch(() => null);
}

export function obtenerSimilares(id: number): Promise<VehiculoResumen[]> {
  return get<VehiculoResumen[]>(`/vehiculos/${id}/similares`, 300).catch(() => []);
}

// El catálogo maestro casi no cambia: cache larga
export function obtenerMarcas(): Promise<Marca[]> {
  return get<Marca[]>('/catalogo/marcas', 3600);
}

export function obtenerCarrocerias(): Promise<Marca[]> {
  return get<Marca[]>('/catalogo/carrocerias', 3600);
}

export const URL_API_PUBLICA = API_URL;
