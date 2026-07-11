// Fetchers del catálogo maestro para los formularios del vendedor (client-side).

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export interface OpcionCatalogo {
  id: number;
  nombre: string;
  slug?: string;
}

export interface Caracteristica {
  id: number;
  nombre: string;
  categoria: string;
}

export interface Departamento {
  id: number;
  nombre: string;
  municipios: OpcionCatalogo[];
}

async function get<T>(ruta: string): Promise<T> {
  const res = await fetch(`${API_URL}${ruta}`);
  if (!res.ok) {
    throw new Error(`No se pudo cargar ${ruta}`);
  }
  return res.json() as Promise<T>;
}

export const cargarMarcas = () => get<OpcionCatalogo[]>('/catalogo/marcas');
export const cargarModelos = (marcaId: number) =>
  get<OpcionCatalogo[]>(`/catalogo/marcas/${marcaId}/modelos`);
export const cargarCarrocerias = () => get<OpcionCatalogo[]>('/catalogo/carrocerias');
export const cargarCombustibles = () => get<OpcionCatalogo[]>('/catalogo/combustibles');
export const cargarTransmisiones = () => get<OpcionCatalogo[]>('/catalogo/transmisiones');
export const cargarCaracteristicas = () => get<Caracteristica[]>('/catalogo/caracteristicas');
export const cargarDepartamentos = () => get<Departamento[]>('/catalogo/departamentos');
