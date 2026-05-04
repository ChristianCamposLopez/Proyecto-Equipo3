// app/admin/repartidor/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type KitchenOrderItem = {
  product_name: string
  quantity: number
  unit_price: number
}

// ✅ Añade el campo deliveryman_name (opcional)
type KitchenOrder = {
  id: number
  status: string
  note: string | null
  total_amount: number
  created_at: string
  customer_name: string | null
  items: KitchenOrderItem[]
  deliveryman_name?: string | null   // ← nuevo
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARING: "En preparacion",
  READY: "Listo",
  DELIVERY_ASSIGNED: "RepartidorEntity asignado",
  DELIVERED: "Entregado",
}

async function readJsonResponse(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    throw new Error("El servidor devolvio una respuesta no valida")
  }
}


const pageStyles = `
  .kitchen-shell {
    min-height: 100vh;
    padding: 40px 24px 60px;
    background: #f3efe7;
    color: #211a14;
    font-family: Arial, Helvetica, sans-serif;
  }

  .kitchen-wrap {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    gap: 24px;
  }

  .kitchen-header {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(60, 45, 32, 0.18);
  }

  .kitchen-eyebrow {
    color: #8f4f2b;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .kitchen-title {
    margin-top: 8px;
    font-size: 40px;
    line-height: 1.1;
  }

  .kitchen-copy {
    margin-top: 10px;
    max-width: 680px;
    color: #5f5146;
    line-height: 1.6;
  }

  .refresh-btn {
    border: 0;
    border-radius: 8px;
    padding: 12px 16px;
    cursor: pointer;
    background: #1f2d2b;
    color: #fffaf2;
    font-weight: 700;
  }

  .orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
  }

  .kitchen-ticket {
    display: grid;
    gap: 16px;
    padding: 18px;
    border: 1px solid rgba(60, 45, 32, 0.16);
    border-radius: 8px;
    background: #fffaf2;
  }

  .ticket-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  .ticket-id {
    font-size: 24px;
    font-weight: 800;
  }

  .ticket-meta {
    margin-top: 4px;
    color: #66574a;
    font-size: 14px;
  }

  .status-pill {
    border-radius: 8px;
    padding: 6px 10px;
    background: #efe0cd;
    color: #6b381d;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .items-list {
    display: grid;
    gap: 10px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(60, 45, 32, 0.1);
  }

  .item-row strong {
    color: #211a14;
  }

  .note-box {
    display: grid;
    gap: 6px;
    padding: 12px;
    border-radius: 8px;
    background: #f5e1d2;
    border: 1px solid rgba(143, 79, 43, 0.24);
  }

  .note-label {
    color: #8f4f2b;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .note-text {
    color: #3b281c;
    line-height: 1.45;
  }

  .empty-kitchen {
    padding: 34px;
    border-radius: 8px;
    background: #fffaf2;
    border: 1px dashed rgba(60, 45, 32, 0.22);
    text-align: center;
    color: #66574a;
  }

  @media (max-width: 680px) {
    .kitchen-shell {
      padding: 24px 14px 42px;
    }

    .kitchen-header {
      display: grid;
    }

    .kitchen-title {
      font-size: 32px;
    }
  }
`
const assignStyles = `
  .ticket-actions {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .assign-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 10px 16px;
    border: 1px solid #2A2620;
    background: transparent;
    color: #C17A3A;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px;
  }
  .assign-btn:hover:not(:disabled) {
    background: #C17A3A;
    color: #111010;
    border-color: #C17A3A;
  }
  .assign-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .assign-error {
    color: #B34A4A;
    font-size: 12px;
    margin: 0;
  }
  .deliveryman-info {
    margin-top: 12px;
    padding: 12px;
    /* Usamos el fondo crema claro de los tickets */
    background: #fffaf2; 
    /* Bordes sutiles acordes a la nueva paleta */
    border: 1px solid rgba(60, 45, 32, 0.16); 
    /* Radio de 8px como en el resto de tu diseño */
    border-radius: 8px; 
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`


export default function DeliveryAssignmentPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assigningOrderId, setAssigningOrderId] = useState<number | null>(null)
  const [assignError, setAssignError] = useState<string | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/repartidor/orders")
      const data = await readJsonResponse(response)
      if (!response.ok) {
        throw new Error(data?.error || "No se pudieron cargar los pedidos")
      }
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudieron cargar los pedidos"
      setError(text)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    if (role !== 'admin' && role !== 'restaurant_admin') {
      router.replace('/login');
    } else {
      setAuthorized(true);
      loadOrders();
    }
  }, [router]);

  const handleAssign = async (orderId: number) => {
    setAssigningOrderId(orderId)
    setAssignError(null)
    try {
      const res = await fetch('/api/repartidor/asignar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await readJsonResponse(res)
      if (!res.ok) throw new Error(data?.error || 'Error al asignar repartidor')
      
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? {
                ...o,
                status: 'DELIVERY_ASSIGNED',
                deliveryman_name: data.repartidor.nombre,
              }
            : o
        )
      )
    } catch (err: any) {
      setAssignError(err.message)
    } finally {
      setAssigningOrderId(null)
    }
  }
  
  if (!authorized) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <div className="delivery-root">
        <header className="delivery-hero">
          <div className="hero-top">
            <div>
              <p className="delivery-label">Logística y Distribución</p>
              <h1 className="delivery-title">Control de <em>Repartidores</em></h1>
              <p className="delivery-subtitle">
                Asignación inteligente de personal para garantizar entregas en tiempo récord.
              </p>
            </div>
            <button className="refresh-btn" onClick={loadOrders} disabled={loading}>
              {loading ? "ACTUALIZANDO..." : "REFRESCAR LISTA"}
            </button>
          </div>
        </header>

        <main className="delivery-main">
          {error && <div className="empty-state">{error}</div>}

          {!error && loading ? (
            <div className="empty-state">Sincronizando órdenes con la flota de reparto...</div>
          ) : !error && orders.length === 0 ? (
            <div className="empty-state">No hay órdenes preparadas pendientes de asignación.</div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div className="order-card" key={order.id}>
                  <div className="card-header">
                    <div>
                      <div className="order-id">ORDEN #{order.id}</div>
                      <div className="customer-info">
                        {order.customer_name ?? "Cliente Premium"} · ${Number(order.total_amount).toFixed(2)}
                      </div>
                    </div>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </div>

                  <div className="card-body">
                    <ul className="items-list">
                      {order.items.map((item, index) => (
                        <li className="item-row" key={index}>
                          <span className="item-qty">{item.quantity}x</span>
                          <span className="item-name">{item.product_name}</span>
                        </li>
                      ))}
                    </ul>

                    {order.note && (
                      <div className="note-box">
                        <span className="note-label">INDICACIONES DE ENTREGA</span>
                        <p className="note-text">{order.note}</p>
                      </div>
                    )}

                    {order.deliveryman_name && (
                      <div className="assigned-box">
                        <span className="assigned-label">REPARTIDOR ASIGNADO</span>
                        <p className="assigned-name">{order.deliveryman_name}</p>
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    {order.status === 'READY' && (
                      <button
                        className="assign-btn"
                        onClick={() => handleAssign(order.id)}
                        disabled={assigningOrderId === order.id}
                      >
                        {assigningOrderId === order.id ? 'ASIGNANDO...' : 'ASIGNAR REPARTIDOR'}
                      </button>
                    )}
                    {assignError && <p className="assign-error">{assignError}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="delivery-footer">
          <span>Consola Logística EQ3</span>
          <span>© 2026 Restaurante Premium</span>
        </footer>
      </div>
    </>
  )
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;700&display=swap');

  .delivery-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .delivery-hero {
    padding: 72px 48px 48px;
    border-bottom: 1px solid #2A2620;
  }

  .hero-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 32px;
  }

  .delivery-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .delivery-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .delivery-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .delivery-subtitle {
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

  .delivery-main {
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

  .customer-info {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    margin-top: 4px;
  }

  .status-badge {
    font-size: 10px;
    padding: 4px 12px;
    border-radius: 2px;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;
    border: 1px solid transparent;
  }

  .status-badge.ready { background: rgba(46, 125, 50, 0.1); color: #2E7D32; border-color: #2E7D32; }
  .status-badge.delivery_assigned { background: rgba(58, 122, 193, 0.1); color: #3A7AC1; border-color: #3A7AC1; }

  .card-body {
    padding: 24px;
    flex: 1;
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

  .assigned-box {
    margin-top: 16px;
    padding: 16px;
    background: rgba(58, 122, 193, 0.05);
    border-left: 2px solid #3A7AC1;
  }

  .assigned-label {
    display: block;
    font-size: 9px;
    color: #3A7AC1;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .assigned-name {
    font-size: 14px;
    font-weight: 500;
  }

  .card-footer {
    padding: 24px;
    border-top: 1px solid #2A2620;
  }

  .assign-btn {
    width: 100%;
    padding: 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px;
    background: #C17A3A;
    color: #111010;
    border: none;
  }

  .assign-btn:hover {
    background: #D68F4A;
  }

  .assign-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .empty-state {
    padding: 80px 0;
    text-align: center;
    border: 1px dashed #2A2620;
    color: #7A7268;
  }

  .delivery-footer {
    padding: 48px;
    border-top: 1px solid #1E1C19;
    font-size: 11px;
    color: #3A3630;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
  }
`;

