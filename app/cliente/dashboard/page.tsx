// app/cliente/dashboard/page.tsx
'use client'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function AdminMenu() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const routes = [
    { 
      name: 'Menu', 
      path: '/cliente/menu', 
      icon: '🍽️', 
      category: 'Operaciones' 
    },
    { 
      name: 'Mis pedidos historial', 
      path: '/cliente/mis-pedidos', 
      icon: '🍽️', 
      category: 'Confirmar pedidos' 
    },
    { 
      name: 'Carrito', 
      path: '/cliente/orders', 
      icon: '🏆', 
      category: 'Analítica' 
    },
    { 
      name: 'Cambiar sesión', 
      path: '/login', 
      icon: '🔐', 
      category: 'Usuario' 
    },
  ];
  
  useEffect(() => {
    // Verificamos si hay una sesión activa
    const savedId = sessionStorage.getItem('userId');

    if (!savedId) {
      // Si no hay ID, lo mandamos al login
      router.replace('/login');
    } else {
      setUserId(savedId);
      setIsAuthorized(true);
    }
  }, [router]);

  // Bloqueo de renderizado hasta confirmar autorización
  if (!isAuthorized) {
    return null; 
  }

  return (
    <>
      {/* Mantiene la referencia a los estilos definidos previamente */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      <div className="menu-root">
        <header className="menu-hero">
          <div className="menu-topbar">
            <div>
              <p className="menu-label">Panel de Cliente</p>
              <h1 className="menu-title">Control <em>Central</em></h1>
              <p className="menu-subtitle">
                Bienvenido, Cliente. Gestione sus pedidos y preferencias desde este portal.
              </p>
            </div>
            
            <div className="cart-chip">
              <p className="cart-chip-label">Sesión Activa</p>
              <div className="cart-chip-total">Cliente</div>
              <p className="cart-chip-meta">Disfruta de nuestros servicios</p>
            </div>
          </div>
        </header>

        <main className="menu-grid">
          {routes.map((route) => (
            <a key={route.path} href={route.path} className="product-card">
              <div className="card-body">
                <span className="card-category">{route.category}</span>
                <div style={{ fontSize: '48px', margin: '12px 0' }}>{route.icon}</div>
                <h2 className="card-name">{route.name}</h2>
                
                <div className="card-actions">
                  <div className="add-btn" style={{ textAlign: 'center' }}>
                    Gestionar Módulo
                  </div>
                </div>
              </div>
            </a>
          ))}
        </main>

        <footer className="menu-footer">
          <span>Consola de Administración - Proyecto Equipo 3</span>
          <span>© 2026 Restaurante Premium</span>
        </footer>
      </div>
    </>
  );
}

// Aquí va la constante 'styles' que ya tienes definida...

// Los estilos se mantienen igual a como los proporcionaste
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .menu-root {
    min-height: 100vh;
    background:
      radial-gradient(circle at top right, rgba(193, 122, 58, 0.16), transparent 28%),
      linear-gradient(180deg, #111010 0%, #171411 100%);
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .menu-hero {
    position: relative;
    padding: 72px 48px 36px;
    border-bottom: 1px solid #2A2620;
    overflow: hidden;
    animation: fadeDown 0.7s ease both;
  }

  .menu-topbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
  }

  .menu-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .menu-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .menu-title em {
    font-style: italic;
    font-weight: 600;
    color: #C17A3A;
  }

  .menu-subtitle {
    margin-top: 16px;
    font-size: 14px;
    color: #A79D90;
    font-weight: 300;
    max-width: 480px;
    line-height: 1.7;
  }

  .cart-chip {
    min-width: 240px;
    padding: 18px 20px;
    border: 1px solid #3B2D21;
    background: rgba(20, 17, 14, 0.92);
    border-radius: 18px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  }

  .cart-chip-label {
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #C17A3A;
  }

  .cart-chip-total {
    margin-top: 8px;
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    color: #F2EDE4;
  }

  .cart-chip-meta {
    margin-top: 6px;
    color: #A79D90;
    font-size: 13px;
  }

  .menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1px;
    background: #1E1C19;
    padding: 0;
    animation: fadeUp 0.6s 0.2s ease both;
  }

  .product-card {
    background: #111010;
    display: flex;
    flex-direction: column;
    transition: background 0.2s;
    text-decoration: none;
    color: inherit;
    position: relative;
    overflow: hidden;
  }

  .product-card:hover { background: #161411; }

  .card-body {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    border: 1px solid transparent;
    transition: all 0.3s;
  }

  .product-card:hover .card-body {
    border-color: #C17A3A;
  }

  .card-name {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
    color: #F2EDE4;
  }

  .card-category {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #C17A3A;
  }

  .card-actions {
    margin-top: 24px;
  }

  .add-btn {
    border: 0;
    border-radius: 999px;
    padding: 12px 16px;
    background: #C17A3A;
    color: #111010;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .menu-footer {
    padding: 24px 48px;
    border-top: 1px solid #1E1C19;
    font-size: 11px;
    color: #5D574F;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 760px) {
    .menu-hero { padding: 48px 24px 32px; }
    .menu-topbar { flex-direction: column; }
    .cart-chip { width: 100%; min-width: 0; }
    .menu-grid { grid-template-columns: 1fr; }
    .menu-footer { padding: 20px 24px; flex-direction: column; }
  }
`;