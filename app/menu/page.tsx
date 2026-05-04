"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { ProductoEntity, CategoriaEntity, CartSummary } from "@/models/entities"

const RESTAURANT_ID = 1

export default function MenuPage() {
  const router = useRouter()
  const [role, setRole] = useState<string>("client")
  const [userId, setUserId] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoriaEntity[]>([])
  const [products, setProducts] = useState<ProductoEntity[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartSummary>(() => ({ ...({} as CartSummary), total_amount: 0, total_quantity: 0, items: [] }))
  const [loading, setLoading] = useState(true)
  const [loadingRecs, setLoadingRecs] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    const savedRole = sessionStorage.getItem("userRole") || "client"
    const savedId = sessionStorage.getItem("customerId") || "1"
    setRole(savedRole)
    setUserId(savedId)
    loadBaseData()
  }, [])

  const loadBaseData = async () => {
    try {
      const res = await fetch(`/api/categorias?restaurantId=${RESTAURANT_ID}`)
      const data = await res.json()
      const uniqueCats = (data.categories || []).filter((v: any, i: any, a: any) => 
        a.findIndex((t: any) => t.name === v.name) === i
      )
      setCategories(uniqueCats)
    } catch (e) {
      console.error(e)
    }
  }

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const isAdmin = role === 'admin' || role === 'restaurant_admin' || role === 'chef'
      let url = `/api/platos?restaurantId=${RESTAURANT_ID}`
      if (isAdmin) url += `&includeInactive=true`
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`
      } else if (activeCategory) {
        url += `&categoryId=${activeCategory}`
      }
      
      const [prodRes, cartRes] = await Promise.all([
        fetch(url),
        fetch(`/api/cart?customerId=${userId || '1'}`)
      ])
      
      const prodData = await prodRes.json()
      const cartData = await cartRes.json()
      
      setProducts(prodData.products || [])
      setCart(cartData || { total_amount: 0, items: [] })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [activeCategory, userId, searchTerm])

  useEffect(() => {
    if (userId && mounted) {
        const handler = setTimeout(() => {
            loadProducts()
        }, 300)
        return () => clearTimeout(handler)
    }
  }, [loadProducts, userId, mounted, searchTerm])

  const loadRecommendations = useCallback(async () => {
    if (!userId) return
    setLoadingRecs(true)
    try {
      const res = await fetch(`/api/recommendations?restaurantId=${RESTAURANT_ID}&customerId=${userId}`)
      const data = await res.json()
      setRecommendations(data.recommendations || [])
    } catch (e) {
      console.error('Error loading recommendations:', e)
      setRecommendations([])
    } finally {
      setLoadingRecs(false)
    }
  }, [RESTAURANT_ID,userId])

  useEffect(() => {
    if (userId && mounted) {
      loadRecommendations()
    }
  }, [userId, mounted])

  const addToCart = async (productId: number) => {
    setUpdatingId(productId)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: userId, productId, quantity: 1 })
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleAvailability = async (productId: number, currentStatus: boolean) => {
    setUpdatingId(productId)
    try {
      const res = await fetch(`/api/platos/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !currentStatus })
      })
      if (res.ok) loadProducts()
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  if (!mounted) return null

  return (
    <>
     <p>user: {userId}</p>
     <p>restaurant: {RESTAURANT_ID}</p>
      <style dangerouslySetInnerHTML={{ __html: menuStyles }} />
      <div className="menu-container">
        <header className="menu-header">
          <div className="header-top">
            <div>
              <div className="label-top">Experiencia Gastronómica</div>
              <h1 className="header-title">
                Menú <em>Digital</em>
              </h1>
              <p className="header-subtitle">
                La Parrilla Mixteca — Sabores que trascienden el tiempo y el espacio.
              </p>
            </div>
            {(role !== 'admin' && role !== 'restaurant_admin' && role !== 'chef') && (
            <Link href="/orders" className="cart-summary-box">
              <span className="cart-label">CARRITO ╱ {cart.total_quantity || 0} ITEMS</span>
              <span className="cart-amount">${Number(cart.total_amount || 0).toFixed(2)}</span>
              <span className="cart-action">Finalizar Pedido ╱ Ver detalles</span>
            </Link>
            )}
          </div>
        </header>

        <main className="menu-content">
          {recommendations.length > 0 && (
            <section className="recommendations-section">
              <h2 className="section-title">🔥 Recomendado para ti</h2>
              <div className="recommendations-grid">
                {recommendations.map(rec => (
                  <div 
                    key={`rec-${rec.id}`} 
                    className="product-entry"
                  >
                    <div className="product-image-container">
                      {rec.image_display ? (
                        <Image 
                          src={rec.image_display} 
                          alt={rec.name} 
                          fill 
                          className="product-img" 
                        />
                      ) : (
                        <div className="img-placeholder">🌟</div>
                      )}
                      <div className="rec-badge">Recomendado</div>
                    </div>

                    <div className="product-details">
                      <div className="details-header">
                        <div className="cat-label">⭐ Favorito</div>
                        <div className="price-tag">${Number(rec.base_price).toFixed(2)}</div>
                      </div>
                      <h3 className="product-name">{rec.name}</h3>
                      <p className="product-desc">
                        {rec.descripcion || "Una de nuestras especialidades, elegida especialmente para ti."}
                      </p>

                      <div className="product-actions">
                        {(role !== 'admin' && role !== 'restaurant_admin' && role !== 'chef') && (
                        <button 
                          onClick={() => addToCart(rec.id)}
                          disabled={updatingId === rec.id}
                          className="action-btn-client"
                        >
                          {updatingId === rec.id ? "PROCESANDO..." : "AGREGAR AL PEDIDO"}
                        </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="filter-bar">
            <div className="search-box">
              <input 
                type="text"
                placeholder="Buscar platillos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setActiveCategory(null)
                }}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

            <nav className="category-nav">
              <button 
                onClick={() => {
                  setActiveCategory(null)
                  setSearchTerm("")
                }}
                className={`cat-btn ${activeCategory === null && !searchTerm ? 'active' : ''}`}
              >
                Todo el Menú
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id)
                    setSearchTerm("")
                  }}
                  className={`cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="product-grid">
            {products.map(product => (
              <div 
                key={product.id} 
                className={`product-entry ${!product.is_active || !product.is_available ? 'unavailable' : ''}`}
              >
                <div className="product-image-container">
                  {product.image_url || product.image_display ? (
                    <Image 
                      src={product.image_url || product.image_display || "/images/default-product.png"} 
                      alt={product.name} 
                      fill 
                      className="product-img" 
                    />
                  ) : (
                    <div className="img-placeholder">🥘</div>
                  )}
                  {!product.is_available && (
                    <div className="sold-out-overlay">
                      <span>Agotado</span>
                    </div>
                  )}
                </div>

                <div className="product-details">
                  <div className="details-header">
                    <div className="cat-label">{product.category_name}</div>
                    <div className="price-tag">${Number(product.base_price).toFixed(2)}</div>
                  </div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">
                    {product.descripcion || "Descripción exclusiva del chef para este platillo artesanal."}
                  </p>

                  <div className="product-actions">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(role === 'admin' || role === 'restaurant_admin' || role === 'chef') && (
                        <button 
                          onClick={() => toggleAvailability(product.id, !!product.is_available)}
                          disabled={updatingId === product.id}
                          className={`action-btn-admin ${product.is_available ? 'deactivate' : 'activate'}`}
                        >
                          {product.is_available ? "Marcar Agotado" : "Habilitar Stock"}
                        </button>
                      )}
                       {(role !== 'admin' && role !== 'restaurant_admin' && role !== 'chef') && (
                      <button 
                        onClick={() => addToCart(product.id)}
                        disabled={!product.is_available || !product.is_active || updatingId === product.id}
                        className="action-btn-client"
                      >
                        {updatingId === product.id ? "PROCESANDO..." : product.is_available ? "AGREGAR AL PEDIDO" : "TEMPORALMENTE AGOTADO"}
                      </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && !loading && (
            <div className="no-results">
              <p>No se encontraron resultados para su búsqueda en nuestra selección actual.</p>
            </div>
          )}
        </main>

        <footer className="menu-footer">
          <span>La Parrilla Mixteca ╱ Selección de Verano</span>
          <span>© 2026 Restaurante EQ3</span>
        </footer>
      </div>
    </>
  )
}

const menuStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;700&display=swap');

  .menu-container {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .menu-header {
    padding: 72px 48px 48px;
    border-bottom: 1px solid #2A2620;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 32px;
  }

  .label-top {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .header-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .header-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .header-subtitle {
    margin-top: 16px;
    font-size: 14px;
    color: #7A7268;
    font-weight: 300;
    max-width: 420px;
    line-height: 1.6;
  }

  .cart-summary-box {
    text-decoration: none;
    color: inherit;
    border: 1px solid #C17A3A;
    padding: 24px 32px;
    border-radius: 2px;
    text-align: right;
    transition: all 0.3s ease;
    background: #161412;
  }

  .cart-summary-box:hover {
    background: #C17A3A;
    color: #111010;
  }

  .cart-label {
    display: block;
    font-size: 10px;
    letter-spacing: 0.2em;
    margin-bottom: 4px;
    opacity: 0.8;
  }

  .cart-amount {
    display: block;
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .cart-action {
    display: block;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.05em;
    opacity: 0.6;
  }

  .cart-summary-box:hover .cart-action {
    opacity: 1;
  }

  .menu-content {
    padding: 32px 48px;
  }

  .filter-bar {
    margin-bottom: 48px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .search-box {
    position: relative;
    max-width: 480px;
  }

  .search-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid #2A2620;
    padding: 12px 12px 12px 40px;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    transition: border-color 0.3s;
  }

  .search-input:focus {
    outline: none;
    border-color: #C17A3A;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.4;
  }

  .category-nav {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: none;
  }

  .cat-btn {
    background: transparent;
    border: 1px solid #2A2620;
    color: #7A7268;
    padding: 8px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    border-radius: 2px;
  }

  .cat-btn:hover, .cat-btn.active {
    border-color: #C17A3A;
    color: #C17A3A;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 32px;
  }

  .product-entry {
    border: 1px solid #2A2620;
    background: #161412;
    transition: all 0.3s ease;
  }

  .product-entry:hover {
    border-color: #C17A3A;
  }

  .product-image-container {
    height: 220px;
    position: relative;
    background: #111010;
    overflow: hidden;
  }

  .product-img {
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .product-entry:hover .product-img {
    transform: scale(1.05);
  }

  .sold-out-overlay {
    position: absolute;
    inset: 0;
    background: rgba(17, 16, 16, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sold-out-overlay span {
    border: 1px solid #F2EDE4;
    padding: 8px 16px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }

  .product-details {
    padding: 24px;
  }

  .details-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 12px;
  }

  .cat-label {
    font-size: 10px;
    color: #C17A3A;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .price-tag {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
  }

  .product-name {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 12px;
    line-height: 1.2;
  }

  .product-desc {
    font-size: 14px;
    color: #7A7268;
    line-height: 1.6;
    margin-bottom: 24px;
    height: 44px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .product-actions {
    border-top: 1px solid #2A2620;
    padding-top: 20px;
  }

  .action-btn-client {
    width: 100%;
    background: transparent;
    border: 1px solid #C17A3A;
    color: #C17A3A;
    padding: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn-client:hover:not(:disabled) {
    background: #C17A3A;
    color: #111010;
  }

  .action-btn-client:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .action-btn-admin {
    width: 100%;
    padding: 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    background: transparent;
    border: 1px solid #2A2620;
    transition: all 0.2s;
  }

  .action-btn-admin.deactivate { color: #B34A4A; }
  .action-btn-admin.deactivate:hover { border-color: #B34A4A; background: rgba(179, 74, 74, 0.1); }
  
  .action-btn-admin.activate { color: #2E7D32; }
  .action-btn-admin.activate:hover { border-color: #2E7D32; background: rgba(46, 125, 50, 0.1); }

  .no-results {
    padding: 80px 0;
    text-align: center;
    border: 1px dashed #2A2620;
  }

  .no-results p {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-style: italic;
    color: #3A3630;
  }

  .unavailable {
    opacity: 0.6;
  }

  .unavailable .action-btn-client {
    opacity: 0.5;
  }

  .recommendations-section {
    margin-bottom: 48px;
    padding-bottom: 32px;
    border-bottom: 1px solid #2A2620;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 24px;
    color: #C17A3A;
  }

  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  .recommendation-card {
    border: 1px solid rgba(193, 122, 58, 0.3);
    background: #161412;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .recommendation-card:hover {
    border-color: #C17A3A;
    background: #1F1C18;
  }

  .rec-image-container {
    height: 200px;
    position: relative;
    background: #111010;
    overflow: hidden;
  }

  .rec-img {
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .recommendation-card:hover .rec-img {
    transform: scale(1.08);
  }

  .rec-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: #C17A3A;
    color: #111010;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 12px;
  }

  .rec-details {
    padding: 20px;
  }

  .rec-name {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.2;
  }

  .rec-price {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: #C17A3A;
    margin-bottom: 16px;
  }

  .rec-actions {
    display: flex;
    gap: 8px;
    flex-direction: column;
  }

  .rec-add-btn {
    width: 100%;
    background: #C17A3A;
    color: #111010;
    border: none;
    padding: 10px 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }

  .rec-add-btn:hover:not(:disabled) {
    background: #D68A48;
  }

  .rec-add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .rec-details-btn {
    text-decoration: none;
    color: #C17A3A;
    border: 1px solid #C17A3A;
    padding: 10px 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: center;
    transition: all 0.2s;
  }

  .rec-details-btn:hover {
    background: rgba(193, 122, 58, 0.1);
  }

  .menu-footer {
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
    .menu-header { padding: 48px 24px; }
    .header-top { flex-direction: column; align-items: flex-start; }
    .cart-summary-box { width: 100%; text-align: left; }
    .menu-content { padding: 24px; }
    .product-grid { grid-template-columns: 1fr; }
    .menu-footer { padding: 24px; flex-direction: column; gap: 8px; }
  }
`;