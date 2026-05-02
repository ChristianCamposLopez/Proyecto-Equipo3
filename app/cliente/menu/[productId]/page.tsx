'use client';

import React, { useEffect, useState } from 'react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .detail-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
    padding-bottom: 48px;
  }

  /* Hero */
  .detail-hero {
    position: relative;
    padding: 72px 48px 48px;
    border-bottom: 1px solid #2A2620;
    overflow: hidden;
    animation: fadeDown 0.7s ease both;
  }

  .detail-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, #3D1F0A44, transparent);
    pointer-events: none;
  }

  .detail-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .detail-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .detail-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .detail-subtitle {
    margin-top: 16px;
    font-size: 14px;
    color: #7A7268;
    font-weight: 300;
    max-width: 420px;
    line-height: 1.6;
  }

  /* Contenido principal */
  .detail-content {
    padding: 32px 48px;
    animation: fadeUp 0.6s 0.1s ease both;
  }

  /* Imagen principal */
  .main-image-container {
    margin-bottom: 32px;
    border: 1px solid #2A2620;
    background: #1A1714;
    border-radius: 2px;
    overflow: hidden;
  }

  .main-image {
    width: 100%;
    max-width: 600px;
    height: auto;
    aspect-ratio: 1/1;
    object-fit: cover;
    display: block;
    margin: 0 auto;
  }

  /* Galería de miniaturas */
  .thumbnails-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 20px;
    letter-spacing: -0.02em;
    border-bottom: 1px solid #2A2620;
    padding-bottom: 12px;
  }

  .thumbnails-title span {
    color: #C17A3A;
    font-style: italic;
    font-weight: 400;
    margin-left: 8px;
  }

  .thumbnails-grid {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .thumbnail {
    width: 100px;
    height: 100px;
    object-fit: cover;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
    background: #1A1714;
    border-radius: 2px;
  }

  .thumbnail:hover {
    border-color: #C17A3A;
    transform: scale(1.02);
  }

  .thumbnail.active {
    border-color: #C17A3A;
    box-shadow: 0 0 0 1px #C17A3A;
  }

  /* Loading */
  .detail-loading {
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

  /* Footer */
  .detail-footer {
    padding: 24px 48px 0;
    border-top: 1px solid #1E1C19;
    font-size: 11px;
    color: #3A3630;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    animation: fadeUp 0.6s 0.2s ease both;
  }

  /* Animaciones */
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .detail-hero { padding: 48px 24px 32px; }
    .detail-content { padding: 24px; }
    .thumbnails-grid { gap: 8px; }
    .thumbnail { width: 70px; height: 70px; }
    .detail-footer { padding: 20px 24px; flex-direction: column; gap: 8px; }
  }
`;

type Image = {
  id: number;
  image_path: string;
  is_primary: boolean;
};

const DEFAULT_IMAGE = '/images/default-product.png'; // La misma que usas en el DAO

export default function ProductoDetallePage({ params }: { params: Promise<{ productId: string }> }) {
  const [images, setImages] = useState<Image[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // 🔥 Estado para controlar el loader

  useEffect(() => {
    async function load() {
      try {
        const { productId } = await params;
        const res = await fetch(`/api/platos/${productId}/images`);
        const data = await res.json();

        const imgs = data.images || [];

        if (imgs.length === 0) {
          // 💡 Si no hay imágenes, creamos una "falsa" para la vista
          const fallback: Image = { id: 0, image_path: DEFAULT_IMAGE, is_primary: true };
          setImages([fallback]);
          setSelectedImage(DEFAULT_IMAGE);
        } else {
          setImages(imgs);
          const primary = imgs.find((i: Image) => i.is_primary) || imgs[0];
          setSelectedImage(primary?.image_path ?? DEFAULT_IMAGE);
        }
      } catch (error) {
        console.error("Error cargando imágenes", error);
        setSelectedImage(DEFAULT_IMAGE);
      } finally {
        setLoading(false); // 🔥 Pase lo que pase, dejamos de cargar
      }
    }
    load();
  }, [params]);

  // 🚩 Cambiamos el check: ahora depende de 'loading', no de 'selectedImage'
  if (loading) {
    return (
      <div className="detail-root">
        <div className="detail-loading">Cargando imágenes…</div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="detail-root">
        <header className="detail-hero">
          <p className="detail-label">Restaurante — Platillo</p>
          <h1 className="detail-title">
            Detalle del <em>Platillo</em>
          </h1>
          <p className="detail-subtitle">
            Explora las imágenes del producto. Selecciona una miniatura para verla en grande.
          </p>
        </header>

        <div className="detail-content">
          <div className="main-image-container">
            {/* Si selectedImage es null, usa el DEFAULT_IMAGE */}
            <img 
              src={selectedImage ?? DEFAULT_IMAGE} 
              className="main-image" 
              alt="Platillo" 
            />
          </div>

          <h2 className="thumbnails-title">
            Galería <span>de imágenes</span>
          </h2>

          <div className="thumbnails-grid">
            {images.map((img) => (
              <img
                key={img.id}
                src={img.image_path}
                onClick={() => setSelectedImage(img.image_path)}
                className={`thumbnail ${
                  selectedImage === img.image_path ? 'active' : ''
                }`}
                alt="Miniatura"
              />
            ))}
          </div>
        </div>

        <footer className="detail-footer">
          <span>Sistema de Pedidos</span>
          <span>{images.length} imágenes</span>
        </footer>
      </div>
    </>
  );
}