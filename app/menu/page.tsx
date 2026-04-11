"use client"
// app/menu/page.tsx — US009.1: Cliente ve imágenes de platillos

import React from 'react'
import { useEffect, useState } from "react"

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

  /* Category filter */
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
    border-radius: 2px;
  }

  .filter-btn:hover { border-color: #C17A3A; color: #C17A3A; }
  .filter-btn.active { background: #C17A3A; border-color: #C17A3A; color: #111010; font-weight: 500; }

  /* Grid */
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
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
    overflow: hidden;
  }

  .product-card:hover { background: #161411; }

  .product-card:hover .card-img { transform: scale(1.04); }

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

  .card-no-img svg { opacity: 0.4; }

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
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 4px 10px;
  }

  .card-unavailable {
    position: absolute;
    inset: 0;
    background: #11101099;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #7A7268;
    backdrop-filter: blur(2px);
  }

  .product-card.unavailable {
    opacity: 0.65;
    pointer-events: none;
  }

  .stock-status {
    position: absolute;
    top: 0;
    right: 0;
    background: #C04040;
    color: #F2EDE4;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 10px;
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
    .menu-filters { padding: 16px 24px; }
    .menu-footer { padding: 20px 24px; flex-direction: column; gap: 8px; }
  }

  /* Add to cart button */
  .add-to-cart-btn {
    width: 100%;
    padding: 12px;
    background: #C17A3A;
    color: #111010;
    border: none;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 12px;
  }

  .add-to-cart-btn:hover:not(:disabled) {
    background: #D18A4A;
  }

  .add-to-cart-btn:disabled {
    background: #7A7268;
    cursor: not-allowed;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  .modal-content {
    background: #111010;
    border: 1px solid #2A2620;
    border-radius: 4px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    animation: scaleIn 0.2s ease;
  }

  .modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .modal-category {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 16px;
  }

  .modal-price {
    font-size: 20px;
    font-weight: 600;
    color: #F2EDE4;
    margin-bottom: 24px;
  }

  .quantity-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .quantity-label {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #7A7268;
  }

  .quantity-control {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #2A2620;
    border-radius: 2px;
  }

  .quantity-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #C17A3A;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .quantity-btn:hover {
    background: #1E1C19;
  }

  .quantity-display {
    width: 40px;
    text-align: center;
    font-weight: 600;
  }

  .modal-buttons {
    display: flex;
    gap: 12px;
  }

  .modal-btn {
    flex: 1;
    padding: 12px;
    border: none;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px;
  }

  .modal-btn.cancel {
    background: #2A2620;
    color: #7A7268;
  }

  .modal-btn.cancel:hover {
    background: #3A3630;
    color: #F2EDE4;
  }

  .modal-btn.confirm {
    background: #C17A3A;
    color: #111010;
  }

  .modal-btn.confirm:hover:not(:disabled) {
    background: #D18A4A;
  }

  .modal-btn.confirm:disabled {
    background: #7A7268;
    cursor: not-allowed;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  /* Floating cart button */
  .floating-cart {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 60px;
    height: 60px;
    background: #C17A3A;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(193, 122, 58, 0.3);
    transition: all 0.2s;
    z-index: 100;
  }

  .floating-cart:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(193, 122, 58, 0.4);
  }

  .cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #dc2626;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
  }
`

type Product = {
  id: number
  name: string
  base_price: number
  is_available: boolean
  stock_quantity: number
  image_url: string | null
  category_name: string
}

type Category = { id: number; name: string }

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  // valores de demostración si la BD está vacía
  const sampleProducts: Product[] = [
    { id: 100, name: 'Ejemplo: Hamburguesa', base_price: 85, is_available: true, stock_quantity: 50, image_url: null, category_name: 'Hamburguesas' },
    { id: 101, name: 'Ejemplo: Taco al Pastor', base_price: 35, is_available: true, stock_quantity: 30, image_url: null, category_name: 'Tacos' },
  ];
  const sampleCategories: Category[] = [
    { id: 1, name: 'Hamburguesas' },
    { id: 2, name: 'Tacos' },
  ];
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/menu/products").then(async (r) => {
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      }),
      fetch("/api/menu/categories").then(async (r) => {
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      }),
    ])
      .then(([prods, cats]) => {
        setProducts(prods as Product[]);
        setCategories(cats as Category[]);
      })
      .finally(() => setLoading(false));
    
    // Count cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
  }, [])

  const addToCart = async () => {
    if (!selectedProduct) return

    setAdding(true)
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existingItem = cart.find((item: any) => item.id === selectedProduct.id)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        cart.push({
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.base_price,
          quantity,
          category: selectedProduct.category_name
        })
      }

      localStorage.setItem('cart', JSON.stringify(cart))
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
      setSelectedProduct(null)
      setQuantity(1)
      alert(`${selectedProduct.name} agregado al carrito!`)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al agregar al carrito')
    } finally {
      setAdding(false)
    }
  }

  const goToCart = () => {
    window.location.href = '/carrito'
  }

  const dataProducts = products.length ? products : sampleProducts
  const dataCategories = categories.length ? categories : sampleCategories

  const filtered = activeCategory
    ? dataProducts.filter(p => p.category_name === dataCategories.find(c => c.id === activeCategory)?.name)
    : dataProducts

  return (
    <>
      <style>{styles}</style>
      <div className="menu-root">
        <header className="menu-hero">
          <p className="menu-label">La Parrilla Mixteca — Menú</p>
          <h1 className="menu-title">Nuestros <em>Platillos</em></h1>
          <p className="menu-subtitle">
            Selecciona tu pedido. Cada platillo preparado al momento con ingredientes frescos.
          </p>
        </header>

        {!loading && categories.length > 0 && (
          <div className="menu-filters">
            <button
              className={`filter-btn ${activeCategory === null ? "active" : ""}`}
              onClick={() => setActiveCategory(null)}
            >
              Todos
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                className={`filter-btn ${activeCategory === c.id ? "active" : ""}`}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="menu-loading">
            <div className="loader-ring" />
            Cargando menú…
          </div>
        ) : filtered.length === 0 ? (
          <div className="menu-empty">Sin platillos disponibles</div>
        ) : (
          <div className="menu-grid">
            {filtered.map((p, i) => (
              <div
                key={p.id}
                className={`product-card card-enter ${!p.is_available ? 'unavailable' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="card-img-wrap">
                  {p.image_url ? (
                    <img className="card-img" src={p.image_url} alt={p.name} />
                  ) : (
                    <div className="card-no-img">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="1"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                      <span>Sin imagen</span>
                    </div>
                  )}
                  {p.image_url && <div className="card-badge">{p.category_name}</div>}
                  {!p.is_available && (
                    <>
                      <div className="stock-status">✕ Agotado</div>
                      <div className="card-unavailable">No disponible</div>
                    </>
                  )}
                </div>
                <div className="card-body">
                  {!p.image_url && <span className="card-category">{p.category_name}</span>}
                  <h2 className="card-name">{p.name}</h2>
                  <div className="card-price">
                    ${Number(p.base_price).toFixed(2)}
                    <span>MXN</span>
                  </div>
                  {p.is_available && (
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => {
                        setSelectedProduct(p)
                        setQuantity(1)
                      }}
                    >
                      + Agregar al carrito
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedProduct && (
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">{selectedProduct.name}</h2>
              <p className="modal-category">{selectedProduct.category_name}</p>
              <div className="modal-price">${Number(selectedProduct.base_price).toFixed(2)} MXN</div>
              
              <div className="quantity-section">
                <label className="quantity-label">Cantidad</label>
                <div className="quantity-control">
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >−</button>
                  <div className="quantity-display">{quantity}</div>
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >+</button>
                </div>
              </div>

              <div className="modal-buttons">
                <button 
                  className="modal-btn cancel"
                  onClick={() => setSelectedProduct(null)}
                >
                  Cancelar
                </button>
                <button 
                  className="modal-btn confirm"
                  onClick={addToCart}
                  disabled={adding}
                >
                  {adding ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <button 
          className="floating-cart"
          onClick={() => window.location.href = '/carrito'}
          title="Ver carrito"
        >
          🛒
          {cartCount > 0 && <div className="cart-badge">{cartCount}</div>}
        </button>

        <footer className="menu-footer">
          <span>Sistema de Pedidos</span>
          <span>{filtered.length} platillos</span>
        </footer>
      </div>
    </>
  )
}