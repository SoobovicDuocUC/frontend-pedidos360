// src/Catalogo.tsx
import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';

export const Catalogo = () => {
  const { instance, accounts } = useMsal();
  const currentUser = accounts[0];
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [procesandoPedido, setProcesandoPedido] = useState<string | null>(null);

  useEffect(() => {
    const cargarProductos = async () => {
      if (!currentUser) return; 
      
      setCargando(true);
      try {
        const response = await instance.acquireTokenSilent({
          scopes: import.meta.env.VITE_API_SCOPE ? import.meta.env.VITE_API_SCOPE.split(' ') : [],
          account: currentUser
        });
        
        // Petición real al API Gateway -> Lambda -> DynamoDB
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/catalogo`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${response.accessToken}` }
        });
        
        const data = await res.json();
        
        // Validamos si DynamoDB devuelve el array bajo una propiedad "Items" u otro formato
        const productosAWS = Array.isArray(data) ? data : (data.Items || []);
        setProductos(productosAWS);
        
      } catch (error) {
        console.error("Error al cargar el catálogo:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, [instance, currentUser]);

  const registrarPedido = (producto: any) => {
    setProcesandoPedido(producto.id);
    setTimeout(() => {
      alert(`✅ ¡Pedido de "${producto.nombre}" registrado con éxito!`);
      setProcesandoPedido(null);
    }, 1000);
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#2c3e50', marginBottom: '15px' }}>Catálogo de Productos</h2>
        <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Por favor, inicia sesión en la parte superior para ver nuestro catálogo.</p>
      </div>
    );
  }

  if (cargando) return (
    <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.2rem', color: '#64748b' }}>
      Cargando catálogo seguro desde AWS DynamoDB...
    </div>
  );

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%', alignSelf: 'flex-start' }}>
      <h2 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '40px', textAlign: 'center', fontWeight: '800' }}>
        Catálogo de Productos
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '30px', justifyItems: 'center' }}>
        {productos.map((prod) => (
          <div key={prod.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #f1f5f9' }}>
            
            <div style={{ width: '100%', height: '180px', backgroundColor: '#f8f9fa', borderRadius: '12px', marginBottom: '20px', overflow: 'hidden' }}>
              <img 
                // Usa la imagen de DynamoDB o genera una por defecto si no existe
                src={prod.imagen || `https://placehold.co/400x300/e2e8f0/475569?text=${prod.nombre}`} 
                alt={prod.nombre} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            
            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '1.3rem', fontWeight: '700', textAlign: 'center' }}>
              {prod.nombre}
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px', alignItems: 'center' }}>
              <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '1.3rem' }}>${prod.precio}</span>
              <span style={{ fontSize: '0.85rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontWeight: '600' }}>Stock: {prod.stock}</span>
            </div>
            
            <button 
              onClick={() => registrarPedido(prod)}
              disabled={procesandoPedido === prod.id}
              style={{ padding: '14px', cursor: procesandoPedido === prod.id ? 'not-allowed' : 'pointer', backgroundColor: procesandoPedido === prod.id ? '#94a3b8' : '#0078D4', color: 'white', border: 'none', borderRadius: '8px', width: '100%', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 12px rgba(0, 120, 212, 0.3)', transition: 'background-color 0.2s' }}
            >
              {procesandoPedido === prod.id ? 'Procesando...' : 'Agregar al Pedido'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};