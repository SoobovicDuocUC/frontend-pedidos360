import { useState } from 'react';
import { useApi } from './useApi';
import { listCatalogo, type Producto } from './api/catalogo';
import { ApiError } from './api/client';

export function Catalogo() {
  const api = useApi();
  const [items, setItems] = useState<Producto[] | null>(null);
  const [raw, setRaw] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = async () => {
    if (!api) {
      setError('No hay sesión activa.');
      return;
    }
    setLoading(true);
    setError(null);
    setItems(null);
    setRaw(null);
    try {
      const data = await listCatalogo(api);
      setItems(data);
      setRaw(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`API ${err.status} ${err.statusText} — ${JSON.stringify(err.body)}`);
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
      <h3>Backend protegido — GET /catalogo</h3>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
        Llama al API Gateway con el <code>Bearer</code> token. 
        El authorizer valida tu sesión y Lambda trae los datos de DynamoDB.
      </p>

      <button className="btn btn-login" onClick={handleLoad} disabled={loading}>
        {loading ? 'Consultando...' : 'Listar Catálogo'}
      </button>

      {error && (
        <p style={{ color: '#d9534f', marginTop: '1rem', wordBreak: 'break-word' }}>
          {error}
        </p>
      )}

      {items && items.length > 0 && (
        <ul style={{ marginTop: '1rem' }}>
          {items.map((p, i) => (
            <li key={String(p.id ?? p.nombre ?? i)}>
              <strong>{p.nombre ?? 'Sin nombre'}</strong> — ${p.precio ?? 0}
            </li>
          ))}
        </ul>
      )}

      {raw != null && (
        <pre
          style={{
            backgroundColor: '#2d2d2d',
            color: '#67cdaa',
            padding: '1rem',
            borderRadius: '6px',
            marginTop: '1rem',
            fontSize: '0.8rem',
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(raw, null, 2)}
        </pre>
      )}
    </div>
  );
}