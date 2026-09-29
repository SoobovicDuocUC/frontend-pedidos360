import type { ApiClient } from './client';

// Definimos la estructura básica de los productos de tu base de datos
export interface Producto {
  id?: number | string;
  nombre?: string;
  precio?: number;
  [key: string]: unknown;
}

// GET /catalogo -> Llama a tu API Gateway real
export async function listCatalogo(api: ApiClient): Promise<Producto[]> {
  const raw = await api.get<unknown>('/catalogo');
  
  if (Array.isArray(raw)) return raw as Producto[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    // Mantenemos la lógica del profesor para encontrar el array de datos
    for (const key of ['items', 'data', 'productos', 'results', 'body']) {
      if (Array.isArray(obj[key])) return obj[key] as Producto[];
    }
  }
  return [];
}