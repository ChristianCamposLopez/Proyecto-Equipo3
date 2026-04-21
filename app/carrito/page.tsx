"use client"
import { useEffect, useState } from "react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  category: string
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cart-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .cart-hero {
    position: relative;
    padding: 72px 48px 48px;
    border-bottom: 1px solid #2A2620;
    overflow: hidden;
    animation: fadeDown 0.7s ease both;
  }

  .cart-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, #3D1F0A44, transparent);
    pointer-events: none;
  }

  .cart-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .cart-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .cart-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .cart-container {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 1px;
    background: #1E1C19;
    padding: 0;
  }

  .cart-items {
    background: #111010;
    padding: 0;
  }

  .cart-item {
    display: flex;
    flex-direction: column;
    padding: 24px;
    border-bottom: 1px solid #1E1C19;
    border-right: 1px solid #1E1C19;
  }

  .cart-item:last-child {
    border-bottom: none;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 12px;
  }

  .item-name {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
  }

  .item-category {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 6px;
  }

  .item-price-unit {
    font-size: 12px;
    color: #7A7268;
  }

  .item-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .quantity-control {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #2A2620;
    border-radius: 2px;
    padding: 4px;
  }

  .quantity-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: #C17A3A;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .quantity-btn:hover {
    background: #1A1714;
  }

  .quantity-display {
    width: 30px;
    text-align: center;
    font-weight: 600;
    font-size: 13px;
  }

  .item-total {
    font-weight: 700;
    color: #C17A3A;
  }

  .remove-btn {
    padding: 6px 12px;
    background: transparent;
    color: #7A7268;
    border: 1px solid #2A2620;
    border-radius: 2px;
    cursor: pointer;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .remove-btn:hover {
    color: #F2EDE4;
    border-color: #C17A3A;
  }

  .cart-summary {
    background: #111010;
    padding: 24px;
    border-bottom: 1px solid #1E1C19;
    font-size: 13px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    color: #7A7268;
  }

  .summary-row.total {
    padding-top: 12px;
    margin-top: 12px;
    border-top: 1px solid #2A2620;
    font-size: 16px;
    font-weight: 700;
    color: #F2EDE4;
  }

  .checkout-btn {
    width: 100%;
    padding: 14px;
    background: #C17A3A;
    color: #111010;
    border: none;
    border-radius: 2px;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    margin-top: 16px;
    transition: all 0.2s;
  }

  .checkout-btn:hover:not(:disabled) {
    background: #D18A4A;
  }

  .checkout-btn:disabled {
    background: #3A3630;
    cursor: not-allowed;
  }

  .back-link {
    display: block;
    margin-top: 12px;
    padding: 10px 12px;
    text-align: center;
    color: #C17A3A;
    text-decoration: none;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    border: 1px solid #2A2620;
    border-radius: 2px;
    transition: all 0.2s;
  }

  .back-link:hover {
    border-color: #C17A3A;
  }

  .empty-state {
    background: #111010;
    padding: 80px 48px;
    text-align: center;
    grid-column: 1 / -1;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  .empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .empty-text {
    color: #7A7268;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .empty-link {
    display: inline-block;
    padding: 10px 24px;
    background: #C17A3A;
    color: #111010;
    border-radius: 2px;
    text-decoration: none;
    font-weight: 600;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .empty-link:hover {
    background: #D18A4A;
  }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 900px) {
    .cart-container {
      grid-template-columns: 1fr;
    }
    .cart-item {
      border-right: none;
    }
  }

  @media (max-width: 600px) {
    .cart-hero { padding: 48px 24px 32px; }
    .item-controls {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`

export default function CartPage(){
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch (e) {
        console.error('Error loading cart:', e)
      }
    }
  }, [])

  const updateCart = (newItems: CartItem[]) => {
    setItems(newItems)
    localStorage.setItem('cart', JSON.stringify(newItems))
  }

  const removeItem = (id: number) => {
    updateCart(items.filter(item => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    updateCart(items.map(item =>
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const tax = subtotal * 0.16
  const total = subtotal + tax

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Tu carrito está vacío')
      return
    }

    setLoading(true)
    try {
      // Get the proper customer_id and restaurant_id
      const configRes = await fetch('/api/config/ids')
      if (!configRes.ok) {
        throw new Error('No se pudo obtener la configuración')
      }
      const config = await configRes.json()

      const requestBody = {
        customer_id: config.customer_id,
        restaurant_id: config.restaurant_id,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price_at_purchase: item.price
        })),
        total_amount: total
      }

      console.log('Enviando pedido:', requestBody)

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      let responseData
      try {
        responseData = await res.json()
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        throw new Error(`Respuesta inválida del servidor (Status: ${res.status})`)
      }

      if (res.ok && responseData.success) {
        localStorage.removeItem('cart')
        setItems([])
        window.location.href = '/confirmacion'
      } else {
        const errorMsg = responseData.error || responseData.message || 'Error desconocido al crear el pedido'
        console.error('Error response:', responseData)
        console.error('Error message:', errorMsg)
        alert(`Error: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al confirmar el pedido: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="cart-root">
        <header className="cart-hero">
          <p className="cart-label">La Parrilla Mixteca — Carrito</p>
          <h1 className="cart-title">Tu <em>Carrito</em></h1>
        </header>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h2 className="empty-title">Tu carrito está vacío</h2>
            <p className="empty-text">Agrega productos desde el menú para comenzar tu pedido</p>
            <a href="/menu" className="empty-link">Ir al Menú</a>
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-header">
                    <div>
                      <div className="item-category">{item.category}</div>
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-price-unit">${Number(item.price).toFixed(2)} c/u</p>
                    </div>
                  </div>
                  <div className="item-controls">
                    <div className="quantity-control">
                      <button 
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <div className="quantity-display">{item.quantity}</div>
                      <button 
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="item-total">${(item.price * item.quantity).toFixed(2)}</div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>IVA (16%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button 
                className="checkout-btn" 
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
              >
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
              <a href="/menu" className="back-link">← Continuar Comprando</a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
