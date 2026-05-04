"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type KitchenOrderItem = {
  product_name: string
  quantity: number
}

type KitchenOrder = {
  id: number
  status: string
  note: string | null
  total_amount: number
  created_at: string
  customer_name: string | null
  items: KitchenOrderItem[]
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARING: "En preparación",
  READY: "Listo",
}

export default function KitchenPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    const savedRole = sessionStorage.getItem("userRole")
    if (savedRole !== "chef" && savedRole !== "admin" && savedRole !== "restaurant_admin") {
      router.replace("/login")
    } else {
      setRole(savedRole)
      setAuthorized(true)
      loadOrders()
    }
  }, [router])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/kitchen/orders")
      const data = await response.json()
      if (response.ok) {
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error cargando pedidos de cocina", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        if (newStatus === "READY") {
          setTimeout(loadOrders, 1000)
        }
      }
    } catch (e) {
      console.error("Error actualizando estado", e)
    } finally {
      setUpdatingId(null)
    }
  }

  if (!authorized) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: kitchenStyles }} />
      <div className="kitchen-root">
        <header className="kitchen-hero">
          <div className="hero-top">
            <div>
              <p className="kitchen-label">Operaciones de Cocina</p>
              <h1 className="kitchen-title">Monitor <em>En Vivo</em></h1>
              <p className="kitchen-subtitle">
                Gestione la preparación de platillos con precisión artesanal y eficiencia operativa.
              </p>
            </div>
            
            <button 
              onClick={loadOrders}
              disabled={loading}
              className="refresh-btn"
            >
              {loading ? "SINCRONIZANDO..." : "REFRESCAR TABLERO"}
            </button>
          </div>
        </header>

        <main className="kitchen-main">
          <div className="orders-grid">
            {orders.length === 0 && !loading && (
              <div className="empty-state">
                <p>No hay pedidos pendientes en la línea de producción.</p>
              </div>
            )}

            {orders.map((order) => (
              <div key={order.id} className={`order-card ${order.status.toLowerCase()}`}>
                <div className="card-header">
                  <div className="order-id">ORDEN #{order.id}</div>
                  <div className={`status-badge ${order.status.toLowerCase()}`}>
                    {statusLabels[order.status] || order.status}
                  </div>
                </div>

                <div className="card-body">
                  <h3 className="customer-name">{order.customer_name || "Cliente Premium"}</h3>
                  <ul className="items-list">
                    {order.items.map((item, i) => (
                      <li key={i} className="item-row">
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.product_name}</span>
                      </li>
                    ))}
                  </ul>

                  {order.note && (
                    <div className="note-box">
                      <span className="note-label">REQUERIMIENTO ESPECIAL</span>
                      <p className="note-text">"{order.note}"</p>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  {order.status === 'PENDING' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'PREPARING')}
                      disabled={updatingId === order.id}
                      className="action-btn primary"
                    >
                      {updatingId === order.id ? "PROCESANDO..." : "EMPEZAR PREPARACIÓN"}
                    </button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'READY')}
                      disabled={updatingId === order.id}
                      className="action-btn success"
                    >
                      {updatingId === order.id ? "PROCESANDO..." : "MARCAR COMO LISTO"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className="kitchen-footer">
          <span>Consola de Producción EQ3</span>
          <span>© 2026 Restaurante Premium</span>
        </footer>
      </div>
    </>
  )
}

const kitchenStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;700&display=swap');

  .kitchen-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .kitchen-hero {
    padding: 72px 48px 48px;
    border-bottom: 1px solid #2A2620;
  }

  .hero-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 32px;
  }

  .kitchen-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .kitchen-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .kitchen-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .kitchen-subtitle {
    margin-top: 16px;
    font-size: 14px;
    color: #7A7268;
    font-weight: 300;
    max-width: 420px;
    line-height: 1.6;
  }

  .refresh-btn {
    background: transparent;
    border: 1px solid #C17A3A;
    color: #C17A3A;
    padding: 12px 24px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 2px;
  }

  .refresh-btn:hover {
    background: #C17A3A;
    color: #111010;
  }

  .kitchen-main {
    padding: 32px 48px;
  }

  .orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 24px;
  }

  .order-card {
    background: #161412;
    border: 1px solid #2A2620;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
  }

  .order-card:hover {
    border-color: #C17A3A;
  }

  .card-header {
    padding: 24px;
    border-bottom: 1px solid #2A2620;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .order-id {
    font-size: 11px;
    letter-spacing: 0.1em;
    color: #7A7268;
    font-weight: 700;
  }

  .status-badge {
    font-size: 10px;
    padding: 4px 12px;
    border-radius: 2px;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .status-badge.pending { background: rgba(193, 122, 58, 0.1); color: #C17A3A; border: 1px solid #C17A3A; }
  .status-badge.preparing { background: rgba(58, 122, 193, 0.1); color: #3A7AC1; border: 1px solid #3A7AC1; }

  .card-body {
    padding: 24px;
    flex: 1;
  }

  .customer-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    margin-bottom: 20px;
  }

  .items-list {
    list-style: none;
    padding: 0;
    margin-bottom: 24px;
  }

  .item-row {
    display: flex;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #1E1C19;
  }

  .item-qty {
    color: #C17A3A;
    font-weight: 700;
    font-size: 14px;
  }

  .item-name {
    color: #F2EDE4;
    font-size: 14px;
  }

  .note-box {
    background: rgba(193, 122, 58, 0.05);
    border-left: 2px solid #C17A3A;
    padding: 16px;
    margin-top: 16px;
  }

  .note-label {
    display: block;
    font-size: 9px;
    color: #C17A3A;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .note-text {
    font-size: 13px;
    color: #7A7268;
    font-style: italic;
  }

  .card-footer {
    padding: 24px;
    border-top: 1px solid #2A2620;
  }

  .action-btn {
    width: 100%;
    padding: 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px;
    border: 1px solid transparent;
  }

  .action-btn.primary {
    background: #C17A3A;
    color: #111010;
  }

  .action-btn.primary:hover {
    background: #D68F4A;
  }

  .action-btn.success {
    background: #2E7D32;
    color: #F2EDE4;
  }

  .action-btn.success:hover {
    background: #388E3C;
  }

  .empty-state {
    grid-column: 1 / -1;
    padding: 80px 0;
    text-align: center;
    border: 1px dashed #2A2620;
  }

  .kitchen-footer {
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
    .kitchen-hero { padding: 48px 24px; }
    .hero-top { flex-direction: column; align-items: flex-start; }
    .kitchen-main { padding: 24px; }
    .orders-grid { grid-template-columns: 1fr; }
    .kitchen-footer { padding: 24px; flex-direction: column; gap: 8px; }
  }
`;

