// src/Orders.tsx
import { useState } from 'react';
import { useMsal } from '@azure/msal-react';

export const Orders = () => {
  const { accounts } = useMsal();
  const currentUser = accounts[0];
  
  const azureRoles = (currentUser?.idTokenClaims?.roles as string[]) || [];
  const [rolDemo, setRolDemo] = useState(azureRoles.includes('Operador') ? 'Operador' : 'Cliente');

  // Simulador actualizado con tus productos y el peluche asignado a ti
  const [pedidos, setPedidos] = useState([
    { id: 'ORD-001', cliente: 'Juan Pérez', producto: 'Ojos para juegos de Shooter', estado: 'Pendiente', fecha: '2026-09-29' },
    { id: 'ORD-002', cliente: currentUser?.name || 'Sebastián Araya', producto: 'Gentildonna Plush', estado: 'En Preparación', fecha: '2026-09-29' },
    { id: 'ORD-003', cliente: 'Alan Thomas', producto: 'Manos para los juegos de Shooter', estado: 'Despachado', fecha: '2026-09-28' }
  ]);

  const cambiarEstado = (id: string, nuevoEstado: string) => {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
  };

  const pedidosVisibles = rolDemo === 'Operador' || rolDemo === 'Admin' 
    ? pedidos 
    : pedidos.filter(p => p.id === 'ORD-002');

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      <div style={{ backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', padding: '10px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#be185d', fontWeight: 'bold' }}>⚙️ Panel de Demostración (Simulador de Roles):</span>
        <select 
          value={rolDemo} 
          onChange={(e) => setRolDemo(e.target.value)}
          style={{ padding: '5px', borderRadius: '4px' }}
        >
          <option value="Cliente">Vista Cliente (Solo ver sus pedidos)</option>
          <option value="Operador">Vista Operador (Ver todos y cambiar estado)</option>
        </select>
      </div>

      <h2 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '10px' }}>Gestión de Pedidos</h2>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>
        {rolDemo === 'Operador' ? 'Visualizando todos los pedidos del sistema.' : 'Visualizando tu historial de pedidos.'}
      </p>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '15px', color: '#475569' }}>ID Pedido</th>
              <th style={{ padding: '15px', color: '#475569' }}>Cliente</th>
              <th style={{ padding: '15px', color: '#475569' }}>Producto</th>
              <th style={{ padding: '15px', color: '#475569' }}>Estado</th>
              {rolDemo === 'Operador' && <th style={{ padding: '15px', color: '#475569' }}>Acciones (Operador)</th>}
            </tr>
          </thead>
          <tbody>
            {pedidosVisibles.map((pedido) => (
              <tr key={pedido.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{pedido.id}</td>
                <td style={{ padding: '15px' }}>{pedido.cliente}</td>
                <td style={{ padding: '15px' }}>{pedido.producto}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                    backgroundColor: pedido.estado === 'Despachado' ? '#dcfce7' : pedido.estado === 'En Preparación' ? '#fef9c3' : '#fee2e2',
                    color: pedido.estado === 'Despachado' ? '#166534' : pedido.estado === 'En Preparación' ? '#854d0e' : '#991b1b'
                  }}>
                    {pedido.estado}
                  </span>
                </td>
                {rolDemo === 'Operador' && (
                  <td style={{ padding: '15px' }}>
                    <button onClick={() => cambiarEstado(pedido.id, 'En Preparación')} style={{ marginRight: '10px', padding: '6px 10px', backgroundColor: '#eab308', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Preparar</button>
                    <button onClick={() => cambiarEstado(pedido.id, 'Despachado')} style={{ padding: '6px 10px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Despachar</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};