// app/admin/dashboard/page.tsx (o tu ruta de menú principal)
"use client"
import { useRouter } from 'next/navigation';
import React from 'react';
import { useEffect, useState } from 'react';

export default function AdminMenu() {
  const routes = [
    { 
      name: 'Gestión de Órdenes', 
      path: '/admin/ordenes', 
      icon: '👨‍🍳', 
      category: 'Operaciones' 
    },
    { 
      name: 'Catálogo de Platos', 
      path: '/admin/platos', 
      icon: '🍽️', 
      category: 'Menú' 
    },
    { 
      name: 'Ranking de Popularidad', 
      path: '/admin/ranking', 
      icon: '🏆', 
      category: 'Analítica' 
    },
    { 
      name: 'Gestión de Reembolsos', 
      path: '/admin/reembolsos', 
      icon: '💸', 
      category: 'Finanzas' 
    },
    { 
      name: 'Reportes de Ventas', 
      path: '/admin/ventas', 
      icon: '📈', 
      category: 'Finanzas' 
    },
    { 
      name: 'Control de Repartidores', 
      path: '/admin/repartidor', 
      icon: '🛵', 
      category: 'Logística' 
    },
    { 
      name: 'Perfil del Restaurante', 
      path: '/admin/restaurante', 
      icon: '🏪', 
      category: 'Configuración' 
    },
    { 
      name: 'Gestión de Stock', 
      path: '/admin/stock', 
      icon: '📦', 
      category: 'Inventario' 
    },
    { 
      name: 'Cambiar sesión', 
      path: '/login', 
      icon: '🔐', 
      category: 'Usuario' 
    },
  ];

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Recuperamos el ID que guardamos en el login
    const savedId = sessionStorage.getItem('userId');
    setUserId(savedId);
  }, []);

  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const savedId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');

    // 🛡️ VALIDACIÓN DE GUARDIA
    const isAdmin = userRole === 'admin' || userRole === 'restaurant_admin';
    
    if (!savedId || !isAdmin) {
      // Si no hay ID o el rol no es de admin, lo mandamos al login
      router.replace('/login'); 
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // Si no está autorizado, no renderizamos el menú para evitar el "parpadeo" de la UI
  if (!authorized) return null;

  return (
    <>
    <p>userId: {userId}</p>
    <p>userRole: {sessionStorage.getItem('userRole')}</p>
      <style dangerouslySetInnerHTML={{ __html: adminStyles }} />
      <div className="admin-root">
        <header className="admin-hero">
          <div className="hero-top">
            <div>
              <p className="admin-label">Panel de Administración</p>
              <h1 className="admin-title">Control <em>Central</em></h1>
              <p className="admin-subtitle">
                Bienvenido al núcleo operativo. Gestione pedidos, catálogo y finanzas con precisión y elegancia.
              </p>
            </div>
            
            <div className="status-chip">
              <p className="status-label">SESIÓN ACTIVA</p>
              <div className="status-value">Admin</div>
              <p className="status-meta">Acceso total autorizado</p>
            </div>
          </div>
        </header>

        <main className="admin-main">
          <div className="admin-grid">
            {routes.map((route) => (
              <a key={route.path} href={route.path} className="admin-card">
                <div className="card-top">
                  <span className="card-tag">{route.category}</span>
                  <span className="card-icon">{route.icon}</span>
                </div>
                <h2 className="card-name">{route.name}</h2>
                <div className="card-footer">
                  <span className="action-text">Gestionar Módulo ╱ Acceder →</span>
                </div>
              </a>
            ))}
          </div>
        </main>

        <footer className="admin-footer">
          <span>Consola de Administración EQ3</span>
          <span>© 2026 Restaurante Premium</span>
        </footer>
      </div>
    </>
  );
}

const adminStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .admin-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .admin-hero {
    padding: 72px 48px 48px;
    border-bottom: 1px solid #2A2620;
  }

  .hero-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 32px;
  }

  .admin-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .admin-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .admin-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .admin-subtitle {
    margin-top: 16px;
    font-size: 14px;
    color: #7A7268;
    font-weight: 300;
    max-width: 420px;
    line-height: 1.6;
  }

  .status-chip {
    border: 1px solid #2A2620;
    padding: 24px 32px;
    border-radius: 2px;
    text-align: right;
    background: #161412;
  }

  .status-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    color: #C17A3A;
    margin-bottom: 4px;
  }

  .status-value {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
  }

  .status-meta {
    font-size: 11px;
    color: #3A3630;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .admin-main {
    padding: 32px 48px;
  }

  .admin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }

  .admin-card {
    text-decoration: none;
    color: inherit;
    border: 1px solid #2A2620;
    background: #161412;
    padding: 32px;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    border-radius: 2px;
  }

  .admin-card:hover {
    border-color: #C17A3A;
    transform: translateY(-2px);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .card-tag {
    font-size: 10px;
    color: #C17A3A;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .card-icon {
    font-size: 24px;
    opacity: 0.8;
  }

  .card-name {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 24px;
    flex: 1;
  }

  .card-footer {
    border-top: 1px solid #2A2620;
    padding-top: 16px;
  }

  .action-text {
    font-size: 11px;
    color: #7A7268;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: color 0.2s;
  }

  .admin-card:hover .action-text {
    color: #C17A3A;
  }

  .admin-footer {
    padding: 48px;
    border-top: 1px solid #1E1C19;
    font-size: 11px;
    color: #3A3630;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
  }

  @media (max-width: 768px) {
    .admin-hero { padding: 48px 24px; }
    .hero-top { flex-direction: column; align-items: flex-start; }
    .status-chip { width: 100%; text-align: left; }
    .admin-main { padding: 24px; }
    .admin-grid { grid-template-columns: 1fr; }
    .admin-footer { padding: 24px; flex-direction: column; gap: 8px; }
  }
`;