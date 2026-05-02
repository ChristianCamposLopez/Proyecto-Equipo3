"use client"

import Image from "next/image"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

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
  }

  .cart-chip-meta {
    margin-top: 6px;
    color: #A79D90;
    font-size: 13px;
  }

  .cart-chip-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 14px;
    padding: 10px 14px;
    border-radius: 999px;
    background: #C17A3A;
    color: #111010;
    text-decoration: none;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .menu-filters {
    display: flex;
    gap: 8px;
    padding: 24px 48px;
    border-bottom: 1px solid #1E1C19;
    overflow-x: auto;
    scrollbar-width: none;
    animation: fadeUp 0.6s 0.1s ease both;
  }

  .menu-filters::-webkit-scrollbar { display: none; }

  .filter-btn {
    flex-shrink: 0;
    padding: 8px 20px;
    border: 1px solid #2A2620;
    background: transparent;
    color: #7A7268;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 999px;
  }

  .filter-btn:hover { border-color: #C17A3A; color: #C17A3A; }
  .filter-btn.active { background: #C17A3A; border-color: #C17A3A; color: #111010; font-weight: 700; }

  .menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
    position: relative;
    overflow: hidden;
  }

  .product-card:hover { background: #161411; }
  .product-card:hover .card-img { transform: scale(1.04); }

  .product-card.is-unavailable {
    opacity: 0.72;
  }

  .product-card.is-unavailable:hover .card-img {
    transform: none;
  }

  .card-img-wrap {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
    background: #1A1714;
  }

  .card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .card-no-img {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #3A3630;
  }

  .card-no-img span {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.4;
  }

  .card-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: #C17A3A;
    color: #111010;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 999px;
  }

  .card-unavailable {
    position: absolute;
    inset: 0;
    background: #111010AA;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #D8CCBA;
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

  .card-stock {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #7A7268;
  }

  .card-stock.low {
    color: #C17A3A;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 18px;
  }

  .add-btn {
    flex: 1;
    border: 0;
    border-radius: 999px;
    padding: 12px 16px;
    background: #C17A3A;
    color: #111010;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform 0.15s ease, opacity 0.2s ease;
  }

  .add-btn:hover { transform: translateY(-1px); }
  .add-btn:disabled { cursor: not-allowed; opacity: 0.55; transform: none; }

  .status-note {
    min-height: 16px;
    font-size: 12px;
    color: #A79D90;
  }

  .status-note.error { color: #F2A7A7; }
  .status-note.success { color: #9FD9A5; }

  .menu-loading, .menu-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 20px;
    color: #7A7268;
    padding: 48px;
  }

  .menu-empty {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-style: italic;
  }

  .loader-ring {
    width: 36px;
    height: 36px;
    border: 2px solid #2A2620;
    border-top-color: #C17A3A;
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
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
    animation: fadeUp 0.6s 0.4s ease both;
  }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .card-enter {
    opacity: 0;
    animation: fadeUp 0.4s ease forwards;
  }

  @media (max-width: 760px) {
    .menu-hero { padding: 48px 24px 32px; }
    .menu-topbar { flex-direction: column; }
    .cart-chip { width: 100%; min-width: 0; }
    .menu-filters { padding: 16px 24px; }
    .menu-footer { padding: 20px 24px; flex-direction: column; }
  }
`

type Product = {
  id: number;
  name: string;
  base_price: number;
  stock: number;          // valor por defecto
  is_available: boolean;  // valor por defecto
  image_url: string | null;
  category_name: string;
  category_id?: number;
};

type Recommendation = {
  id: number;
  name: string;
  base_price: string;     // viene como string desde la API
  image_display: string;
};

type Category = { id: number; name: string };

type CartSummary = {
  item_count: number;
  total_quantity: number;
  total_amount: number;
};

const RESTAURANT_ID = "1";

export default function MenuPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null); // Estado para el ID real
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [cart, setCart] = useState<CartSummary>({
    item_count: 0,
    total_quantity: 0,
    total_amount: 0,
  });
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  /*useEffect(() => {
    const savedId = localStorage.getItem('userId');
    if (savedId) {
      setCustomerId(parseInt(savedId));
    }
  }, []); */

  // 1. Cargar categorías
  useEffect(() => {
    fetch(`/api/categorias?restaurantId=${RESTAURANT_ID}`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
      })
      .catch(console.error)
      .finally(() => setLoadingCategories(false));
  }, []);

  // 2. Cargar productos según categoría activa
  useEffect(() => {
    if (loadingCategories) return;
    setLoadingProducts(true);
    let url = `/api/platos?restaurantId=${RESTAURANT_ID}`;
    if (activeCategory !== null) {
      url += `&categoryId=${activeCategory}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const rawProducts = data.products || [];
        const mappedProducts: Product[] = rawProducts.map((p: any) => {
          let categoryName = "Sin categoría";
          if (p.category_name) {
            categoryName = p.category_name;
          } else if (p.category_id && categories.length > 0) {
            const cat = categories.find((c) => c.id === p.category_id);
            if (cat) categoryName = cat.name;
          } else if (activeCategory !== null) {
            const activeCat = categories.find((c) => c.id === activeCategory);
            if (activeCat) categoryName = activeCat.name;
          }
          return {
            id: p.id,
            name: p.name,
            base_price: typeof p.base_price === "string" ? parseFloat(p.base_price) : p.base_price,
            stock: 100,
            is_available: true,
            image_url: p.image_display && p.image_display.trim() !== "" ? p.image_display : null,
            category_name: categoryName,
            category_id: p.category_id,
          };
        });
        setProducts(mappedProducts);
      })
      .catch(console.error)
      .finally(() => setLoadingProducts(false));
  }, [activeCategory, categories, loadingCategories]);

  // 3. Cargar recomendaciones
  useEffect(() => {
    if (!customerId) return; // Esperar a tener el ID

    fetch(`/api/recommendations?restaurantId=${RESTAURANT_ID}&customerId=${customerId}`, { 
      cache: "no-store" 
    })
      .then((res) => res.json())
      .then((data) => setRecommendations(data.recommendations || []))
      .catch(console.error)
      .finally(() => setLoadingRecommendations(false));
  }, [customerId]); // Se dispara cuando el customerId esté listo

  // 4. Cargar resumen del carrito
  useEffect(() => {
    if (!customerId) return;

    fetch(`/api/cart?customerId=${customerId}`)
      .then(async (r) => {
        const data = await r.json();
        return data && typeof data === "object"
          ? data
          : { item_count: 0, total_quantity: 0, total_amount: 0 };
      })
      .then(setCart)
      .catch(console.error);
  }, [customerId]);

  // 5. Agregar al carrito (MODIFICADO: Usa el ID real)
  const addToCart = async (productId: number) => {
    if (!customerId) {
      setFeedback({ type: "error", message: "Debe iniciar sesión para comprar" });
      return;
    }

    setPendingProductId(productId);
    setFeedback(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId, // ID Real
          productId,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo agregar");
      setCart(data as CartSummary);
      setFeedback({ type: "success", message: "Producto agregado al carrito" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al agregar";
      setFeedback({ type: "error", message });
    } finally {
      setPendingProductId(null);
    }
  };

  const hasValidImage = (url: string) => url && url.trim() !== "" && url !== "null" && url !== "undefined";

  const loading = loadingCategories || loadingProducts || loadingRecommendations;

  // Hook 14: Auth check
  useEffect(() => {
    const savedId = sessionStorage.getItem('userId');
    if (!savedId) {
      router.replace('/login');
    } else {
      setCustomerId(parseInt(savedId));
      setIsAuthorized(true);
    }
  }, [router]);


  if (!isAuthorized) {
    return null; 
  }

  return (
    <>
      <p>customerId: {customerId}</p>
      <style>{styles}</style> {/* Aquí van los estilos originales de page2 (los del archivo) */}
      <div className="menu-root">
        <header className="menu-hero">
          <div className="menu-topbar">
            <div>
              <p className="menu-label">La Parrilla Mixteca — Menú</p>
              <h1 className="menu-title">Nuestros <em>Platillos</em></h1>
              <p className="menu-subtitle">
                Selecciona tus productos, agrégalos al carrito o consulta sus detalles.
              </p>
            </div>
            <aside className="cart-chip">
              <div className="cart-chip-label">Carrito activo</div>
              <div className="cart-chip-total">${Number(cart.total_amount).toFixed(2)}</div>
              <div className="cart-chip-meta">
                {cart.total_quantity} productos seleccionados en {cart.item_count} renglones
              </div>
              <a className="cart-chip-link" href="/cliente/orders">
                Revisar carrito
              </a>
            </aside>
          </div>
        </header>

        {!loadingCategories && categories.length > 0 && (
          <div className="menu-filters">
            <button
              className={`filter-btn ${activeCategory === null ? "active" : ""}`}
              onClick={() => setActiveCategory(null)}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-btn ${activeCategory === category.id ? "active" : ""}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {feedback && (
          <div style={{ padding: "18px 48px 0" }}>
            <p className={`status-note ${feedback.type}`}>{feedback.message}</p>
          </div>
        )}

        {loading ? (
          <div className="menu-loading">
            <div className="loader-ring" />
            Cargando menú y recomendaciones…
          </div>
        ) : (
          <>
            {/* SECCIÓN DE RECOMENDACIONES */}
            {recommendations.length > 0 && (
              <section className="menu-recommendations" style={{ padding: "0 48px", marginBottom: "32px" }}>
                <h2 className="menu-section-title" style={{ color: "#C17A3A", marginTop: 0 }}>
                  Recomendado para ti 🔥
                </h2>
                <div className="menu-grid">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={`rec-${rec.id}`}
                      className="product-card"
                      style={{
                        animationDelay: `${idx * 0.05}s`,
                        border: "1px solid rgba(193, 122, 58, 0.3)",
                      }}
                    >
                      <div className="card-img-wrap">
                        {hasValidImage(rec.image_display) ? (
                          <img
                            className="card-img"
                            src={rec.image_display}
                            alt={rec.name}
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                const placeholder = document.createElement("div");
                                placeholder.className = "card-no-img";
                                placeholder.innerHTML = `
                                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                          <div className="card-no-img">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <rect x="3" y="3" width="18" height="18" rx="1" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="M21 15l-5-5L5 21" />
                            </svg>
                            <span>Sin imagen</span>
                          </div>
                        )}
                        <div className="card-badge" style={{ backgroundColor: "#C17A3A" }}>Recomendado</div>
                      </div>
                      <div className="card-body">
                        <h2 className="card-name">{rec.name}</h2>
                        <div className="card-price">
                          ${typeof rec.base_price === "string" ? parseFloat(rec.base_price).toFixed(2) : rec.base_price}
                          <span>MXN</span>
                        </div>
                        <div className="card-actions" style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                          <button
                            className="add-btn"
                            onClick={() => addToCart(rec.id)}
                            disabled={pendingProductId === rec.id}
                          >
                            {pendingProductId === rec.id ? "Agregando..." : "Agregar al carrito"}
                          </button>
                          <Link href={`/cliente/menu/${rec.id}`} className="btn-details">
                            Ver detalles
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.05)", margin: "24px 0" }} />
              </section>
            )}

            {/* MENÚ PRINCIPAL */}
            <div style={{ padding: "0 48px" }}>
              <h2 className="menu-section-title" style={{ marginTop: 0 }}>Menú Principal</h2>
              {products.length === 0 ? (
                <div className="menu-empty">Sin platillos disponibles</div>
              ) : (
                <div className="menu-grid">
                  {products.map((product, idx) => (
                    <div
                      key={product.id}
                      className={`product-card ${!product.is_available ? "is-unavailable" : ""}`}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="card-img-wrap">
                        {product.image_url ? (
                          <Image
                            className="card-img"
                            src={product.image_url}
                            alt={product.name}
                            width={640}
                            height={480}
                          />
                        ) : (
                          <div className="card-no-img">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <rect x="3" y="3" width="18" height="18" rx="1" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="M21 15l-5-5L5 21" />
                            </svg>
                            <span>Sin imagen</span>
                          </div>
                        )}
                        <div className="card-badge">{product.category_name}</div>
                        {!product.is_available && <div className="card-unavailable">No disponible</div>}
                      </div>
                      <div className="card-body">
                        <h2 className="card-name">{product.name}</h2>
                        <div className="card-price">
                          ${product.base_price.toFixed(2)}
                          <span>MXN</span>
                        </div>
                        <div className="card-actions" style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                          <button
                            className="add-btn"
                            onClick={() => addToCart(product.id)}
                            disabled={!product.is_available || pendingProductId === product.id}
                          >
                            {pendingProductId === product.id ? "Agregando..." : "Agregar al carrito"}
                          </button>
                          <Link href={`/cliente/menu/${product.id}`} className="btn-details">
                            Ver detalles
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <footer className="menu-footer">
          <span>Sistema de Pedidos</span>
          <span>{products.length} platillos visibles</span>
          <span>Total del carrito: ${Number(cart.total_amount).toFixed(2)}</span>
        </footer>
      </div>

      {/* Estilos adicionales para el botón "Ver detalles" (tomados de page1) */}
      <style>{`
        .btn-details {
          display: inline-block;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-radius: 40px;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          background: transparent;
          color: #C17A3A;
          border: 1px solid #C17A3A;
          text-align: center;
        }
        .btn-details:hover {
          background: rgba(193, 122, 58, 0.1);
          transform: scale(1.02);
        }
        .menu-recommendations .add-btn {
          background: #C17A3A;
          color: #111010;
          border: none;
        }
        .menu-recommendations .add-btn:hover {
          background: #D48A4A;
        }
      `}</style>
    </>
  );
}