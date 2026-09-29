// src/Dashboard.tsx
import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { TokenInspector } from './TokenInspector';

export function Dashboard() {
  const { instance, accounts } = useMsal();
  const currentUser = accounts[0];
  
  // Estados para nuestra prueba de la API
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loadingApi, setLoadingApi] = useState(false);

  // Función que hace el GET al catálogo para mostrar el JSON crudo
  const probarGetCatalogo = async () => {
    setLoadingApi(true);
    try {
      const response = await instance.acquireTokenSilent({
        scopes: import.meta.env.VITE_API_SCOPE ? import.meta.env.VITE_API_SCOPE.split(' ') : [],
        account: currentUser
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/catalogo`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${response.accessToken}` }
      });
      
      const data = await res.json();
      setApiResponse(data);
    } catch (error: any) {
      console.error(error);
      setApiResponse({ error: "Error al consultar la API", detalle: error.message });
    } finally {
      setLoadingApi(false);
    }
  };

  return (
    <div className="card">
      <div className="avatar">
        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
      </div>
      <h2>¡Bienvenido, {currentUser?.name || 'Usuario'}!</h2>
      <p className="subtitle">Autenticado con Microsoft Entra ID</p>

      <div className="user-details">
        <div className="detail-item">
          <strong>Correo / Usuario:</strong>
          <span>{currentUser?.username}</span>
        </div>
        <div className="detail-item">
          <strong>Tenant ID:</strong>
          <code>{currentUser?.tenantId}</code>
        </div>
      </div>

      <hr style={{ margin: '1.5rem 0', borderColor: '#eee' }} />
      
      {/* Inspector de Token que ya tenías */}
      <TokenInspector />

      <hr style={{ margin: '1.5rem 0', borderColor: '#eee' }} />

      {/* Nueva sección para probar el GET directamente desde el Dashboard */}
      <div style={{ textAlign: 'left', marginTop: '20px' }}>
        <h3>Backend protegido — GET /catalogo</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          Llama al API Gateway con el Bearer token. El authorizer valida tu sesión y Lambda trae los datos crudos de DynamoDB.
        </p>
        
        <button 
          onClick={probarGetCatalogo} 
          disabled={loadingApi}
          style={{ 
            backgroundColor: '#0078D4', color: 'white', padding: '10px 16px', 
            borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' 
          }}
        >
          {loadingApi ? 'Consultando...' : 'Listar Catálogo (Ver JSON)'}
        </button>

        {/* Caja negra estilo consola para mostrar el resultado JSON */}
        {apiResponse && (
          <div style={{ marginTop: '15px', backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '6px', color: '#00ff00', overflowX: 'auto' }}>
            <pre style={{ margin: 0, fontSize: '13px' }}>
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}