// src/App.tsx
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from './authConfig';
import { RequireAuth } from './RequireAuth';
import { RequireRole } from './RequireRole';
import { Catalogo } from './Catalogo';
import { Dashboard } from './Dashboard';
import { AdminDemo } from './AdminDemo';
import './App.css';

function Nav() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    if (inProgress === InteractionStatus.None) {
      instance.loginRedirect(loginRequest).catch((e) => console.error(e));
    }
  };

  const handleLogout = () => {
    if (inProgress === InteractionStatus.None) {
      instance
        .logoutRedirect({ postLogoutRedirectUri: '/' })
        .catch((e) => console.error(e));
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <header className="navbar">
      <div className="logo">
        ⚡ <span>Pedidos360</span>
      </div>

      {/* Menú de navegación principal visible al iniciar sesión */}
      {isAuthenticated && (
        <nav className="nav-links">
          <NavLink to="/" end className={linkClass}>
            Catálogo
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin" className={linkClass}>
            Admin
          </NavLink>
        </nav>
      )}

      <div>
        {isAuthenticated ? (
          <button
            className="btn btn-logout"
            onClick={handleLogout}
            disabled={inProgress !== InteractionStatus.None}
          >
            Cerrar Sesión
          </button>
        ) : (
          <button
            className="btn btn-login"
            onClick={handleLogin}
            disabled={inProgress !== InteractionStatus.None}
          >
            Iniciar Sesión
          </button>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Nav />
        <main className="container">
          <Routes>
            {/* Pública: ahora el Catálogo es la Landing Page oficial */}
            <Route path="/" element={<Catalogo />} />

            {/* Guard de AUTENTICACIÓN: agrupa las rutas que exigen sesión */}
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Guard de AUTORIZACIÓN anidado: además exige el rol Admin */}
              <Route element={<RequireRole role="Admin" />}>
                <Route path="/admin" element={<AdminDemo />} />
              </Route>
            </Route>

            {/* Cualquier ruta que no exista te devuelve al Catálogo */}
            <Route path="*" element={<Catalogo />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}