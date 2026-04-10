//restaurantes/[restaurantId]/catalogo/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .menu-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  /* Hero */
  .menu-hero {
    position: relative;
    padding: 72px 48px 48px;
    border-bottom: 1px solid #2A2620;
    overflow: hidden;
    animation: fadeDown 0.7s ease both;
  }

  .menu-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, #3D1F0A44, transparent);
    pointer-events: none;
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
    font-weight: 400;
    color: #C17A3A;
  }

  .menu-subtitle {
    margin-top: 16px;
    font-size: 14px;
    color: #7A7268;
    font-weight: 300;
    max-width: 420px;
    line-height: 1.6;
  }

  /* Section title */
  .menu-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    margin: 48px 48px 24px;
    letter-spacing: -0.01em;
    color: #F2EDE4;
  }

  /* Grid */
  .menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1px;
    background: #1E1C19;
    padding: 0;
    margin: 0 0 24px 0;
    animation: fadeUp 0.6s 0.2s ease both;
  }

  .product-card {
    background: #111010;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
  }

  .product-card:hover { background: #161411; }

  .product-card:hover .card-img { transform: scale(1.04); }

  .card-img-wrap {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
    background: #1A1714;
    min-height: 200px; /* Altura mínima asegurada */
  }

  .card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  /* Estilos mejorados para el placeholder de imagen */
  .card-no-img {
    width: 100%;
    height: 100%;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: linear-gradient(135deg, #1A1714 0%, #131110 100%);
    color: #4A4540;
  }

  .card-no-img svg { 
    width: 48px;
    height: 48px;
    stroke: #5A5550;
    stroke-width: 1.2;
    opacity: 0.6;
  }

  .card-no-img span {
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.5;
    color: #8A8580;
    font-weight: 300;
  }

  .card-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: #C17A3A;
    color: #111010;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 4px 10px;
    z-index: 10;
  }

  .card-body {
    padding: 20px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .card-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
  }

  .card-category {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #C17A3A;
  }

  .card-price {
    margin-top: auto;
    padding-top: 16px;
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: #F2EDE4;
  }

  .card-price span {
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    color: #7A7268;
    margin-left: 2px;
  }

  /* Loading */
  .menu-loading {
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
  .menu-empty {
    padding: 80px 48px;
    text-align: center;
    color: #3A3630;
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-style: italic;
    font-weight: 400;
  }

  /* Footer */
  .menu-footer {
    padding: 24px 48px;
    border-top: 1px solid #1E1C19;
    font-size: 11px;
    color: #3A3630;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    animation: fadeUp 0.6s 0.4s ease both;
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
    .menu-hero { padding: 48px 24px 32px; }
    .menu-section-title { margin: 32px 24px 16px; font-size: 24px; }
    .menu-footer { padding: 20px 24px; flex-direction: column; gap: 8px; }
  }
`;

type Product = {
  id: number;
  name: string;
  base_price: string;
  image_display: string;
};

type Recommendation = {
  id: number;
  name: string;
  base_price: string;
  image_display: string;
};

export default function CatalogoPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  useEffect(() => {
    async function load() {
      const { restaurantId } = await params;
      setRestaurantId(restaurantId);

      try {
        const res = await fetch(`/api/platos?restaurantId=${restaurantId}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }

      try {
        const recRes = await fetch(`/api/recommendations?restaurantId=${restaurantId}`, { cache: 'no-store' });
        const recData = await recRes.json();
        setRecommendations(recData.recommendations || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoadingRecommendations(false);
      }
    }

    load();
  }, [params]);

  // Función para verificar si hay una imagen válida
  const hasValidImage = (imageUrl: string) => {
    return imageUrl && imageUrl.trim() !== "" && imageUrl !== "null" && imageUrl !== "undefined";
  };

  if (!restaurantId || loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="menu-root">
          <div className="menu-loading">
            <div className="loader-ring" />
            Cargando menú…
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="menu-root">
        <header className="menu-hero">
          <p className="menu-label">Restaurante — Catálogo</p>
          <h1 className="menu-title">
            Nuestros <em>Platillos</em>
          </h1>
          <p className="menu-subtitle">
            Selecciona tu pedido. Cada platillo preparado al momento con ingredientes frescos.
          </p>
        </header>

        {/* Sección de recomendaciones - CORREGIDA */}
        {!loadingRecommendations && recommendations.length > 0 && (
          <section className="menu-recommendations">
            <h2 className="menu-section-title" style={{ color: '#C17A3A' }}>
              Recomendado para ti 🔥
            </h2>

            <div className="menu-grid">
              {recommendations.map((p, i) => (
                <Link
                  key={`rec-${p.id}`}
                  href={`/restaurantes/${restaurantId}/catalogo/${p.id}`}
                  className="product-card card-enter"
                  style={{ animationDelay: `${i * 0.05}s`, border: '1px solid rgba(193, 122, 58, 0.3)' }}
                >
                  <div className="card-img-wrap">
                    {/* CORRECCIÓN: Verificación explícita para mostrar el placeholder */}
                    {hasValidImage(p.image_display) ? (
                      <img 
                        className="card-img" 
                        src={p.image_display} 
                        alt={p.name}
                        onError={(e) => {
                          // Si la imagen falla al cargar, reemplazar con placeholder
                          const target = e.currentTarget;
                          const parent = target.parentElement;
                          if (parent) {
                            // Ocultar la imagen
                            target.style.display = 'none';
                            // Crear y mostrar el placeholder
                            const placeholder = document.createElement('div');
                            placeholder.className = 'card-no-img';
                            placeholder.style.width = '100%';
                            placeholder.style.height = '100%';
                            placeholder.style.display = 'flex';
                            placeholder.innerHTML = `
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                                <rect x="3" y="3" width="18" height="18" rx="1"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <path d="M21 15l-5-5L5 21"/>
                              </svg>
                              <span>Sin imagen</span>
                            `;
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      // Placeholder directo cuando no hay URL de imagen
                      <div className="card-no-img" style={{ width: '100%', height: '100%', display: 'flex' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                          <rect x="3" y="3" width="18" height="18" rx="1"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                        <span>Sin imagen</span>
                      </div>
                    )}
                    <div className="card-badge" style={{ backgroundColor: '#C17A3A' }}>Recomendado</div>
                  </div>

                  <div className="card-body">
                    <h2 className="card-name">{p.name}</h2>
                    <div className="card-price">
                      ${p.base_price}
                      <span>MXN</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 48px 24px 48px' }} />
          </section>
        )}

        {/* GRID PRINCIPAL */}
        <h2 className="menu-section-title">Menú Principal</h2>
        {products.length === 0 ? (
          <div className="menu-empty">No hay platillos disponibles</div>
        ) : (
          <div className="menu-grid">
            {products.map((p, i) => (
              <Link
                key={p.id}
                href={`/restaurantes/${restaurantId}/catalogo/${p.id}`}
                className="product-card card-enter"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="card-img-wrap">
                  {hasValidImage(p.image_display) ? (
                    <img 
                      className="card-img" 
                      src={p.image_display} 
                      alt={p.name}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const parent = target.parentElement;
                        if (parent) {
                          target.style.display = 'none';
                          const placeholder = document.createElement('div');
                          placeholder.className = 'card-no-img';
                          placeholder.style.width = '100%';
                          placeholder.style.height = '100%';
                          placeholder.style.display = 'flex';
                          placeholder.innerHTML = `
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                              <rect x="3" y="3" width="18" height="18" rx="1"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <path d="M21 15l-5-5L5 21"/>
                            </svg>
                            <span>Sin imagen</span>
                          `;
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  ) : (
                    <div className="card-no-img" style={{ width: '100%', height: '100%', display: 'flex' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="3" y="3" width="18" height="18" rx="1"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                      <span>Sin imagen</span>
                    </div>
                  )}
                  {hasValidImage(p.image_display) && <div className="card-badge">Plato</div>}
                </div>
                <div className="card-body">
                  {!hasValidImage(p.image_display) && <span className="card-category">Plato</span>}
                  <h2 className="card-name">{p.name}</h2>
                  <div className="card-price">
                    ${p.base_price}
                    <span>MXN</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <footer className="menu-footer">
          <span>Sistema de Pedidos</span>
          <span>{products.length} platillos</span>
        </footer>
      </div>
    </>
  );
}