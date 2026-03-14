'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .admin-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  /* Hero */
  .admin-hero {
    position: relative;
    padding: 72px 48px 48px;
    border-bottom: 1px solid #2A2620;
    overflow: hidden;
    animation: fadeDown 0.7s ease both;
  }

  .admin-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, #3D1F0A44, transparent);
    pointer-events: none;
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

  /* Lista de platos */
  .admin-list {
    padding: 32px 48px;
    animation: fadeUp 0.6s 0.1s ease both;
  }

  .admin-card {
    background: #111010;
    border-bottom: 1px solid #2A2620;
    padding: 20px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    transition: background 0.2s;
  }

  .admin-card:hover {
    background: #161411;
    padding-left: 12px;
    padding-right: 12px;
    margin: 0 -12px;
    border-bottom-color: #C17A3A;
  }

  .admin-info {
    flex: 1;
  }

  .admin-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 4px;
  }

  .admin-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;
    color: #7A7268;
  }

  .admin-price {
    color: #F2EDE4;
    font-weight: 500;
  }

  .admin-price span {
    font-size: 12px;
    font-weight: 300;
    color: #7A7268;
    margin-left: 2px;
  }

  .admin-badge {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 2px;
    background: #1E1C19;
    color: #7A7268;
  }

  .admin-badge.available {
    background: #1E2A1E;
    color: #8FC98F;
  }

  .admin-badge.unavailable {
    background: #2A1E1E;
    color: #C17A3A;
  }

  .admin-edit-btn {
    background: #C17A3A;
    color: #111010;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 10px 24px;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
    text-decoration: none;
    display: inline-block;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .admin-edit-btn:hover {
    background: #D68F4A;
  }

  /* Loading */
  .admin-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 20px;
    color: #7A7268;
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .loader-ring {
    width: 36px;
    height: 36px;
    border: 2px solid #2A2620;
    border-top-color: #C17A3A;
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
  }

  /* Empty */
  .admin-empty {
    padding: 80px 48px;
    text-align: center;
    color: #3A3630;
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-style: italic;
    font-weight: 400;
  }

  /* Footer */
  .admin-footer {
    padding: 24px 48px;
    border-top: 1px solid #1E1C19;
    font-size: 11px;
    color: #3A3630;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    animation: fadeUp 0.6s 0.2s ease both;
  }

  /* Animations */
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .card-enter {
    opacity: 0;
    animation: fadeUp 0.4s ease forwards;
  }

  @media (max-width: 600px) {
    .admin-hero { padding: 48px 24px 32px; }
    .admin-list { padding: 24px; }
    .admin-card { flex-direction: column; align-items: flex-start; }
    .admin-edit-btn { align-self: flex-end; }
    .admin-footer { padding: 20px 24px; flex-direction: column; gap: 8px; }
  }
`;

type Product = {
  id: number;
  name: string;
  base_price: string;
  is_available?: boolean; // Opcional, por si la API lo incluye
};

export default function AdminPlatosPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { restaurantId } = await params;
      setRestaurantId(restaurantId);

      try {
        const res = await fetch(`/api/platos?restaurantId=${restaurantId}&includeInactive=true`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params]);

  if (!restaurantId || loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="admin-root">
          <div className="admin-loading">
            <div className="loader-ring" />
            Cargando platos…
          </div>
        </div>
      </>
    );
  }

  const showEmpty = products.length === 0;

  return (
    <>
      <style>{styles}</style>
      <div className="admin-root">
        <header className="admin-hero">
          <p className="admin-label">Administración</p>
          <h1 className="admin-title">
            Gestión de <em>Platos</em>
          </h1>
          <p className="admin-subtitle">
            Lista completa de platos del restaurante. Puedes editar cada uno o crear nuevos.
          </p>
        </header>

        {showEmpty ? (
          <div className="admin-empty">No hay platos registrados</div>
        ) : (
          <div className="admin-list">
            {products.map((p, i) => (
              <div
                key={p.id}
                className="admin-card card-enter"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="admin-info">
                  <h2 className="admin-name">{p.name}</h2>
                  <div className="admin-meta">
                    <span className="admin-price">
                      ${p.base_price} <span>MXN</span>
                    </span>
                    {p.is_available !== undefined && (
                      <span className={`admin-badge ${p.is_available ? 'available' : 'unavailable'}`}>
                        {p.is_available ? 'Disponible' : 'No disponible'}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/admin/restaurantes/${restaurantId}/platos/editar/${p.id}`}
                  className="admin-edit-btn"
                >
                  Editar
                </Link>
              </div>
            ))}
          </div>
        )}

        <footer className="admin-footer">
          <span>Sistema de Administración</span>
          <span>{products.length} platos</span>
        </footer>
      </div>
    </>
  );
}