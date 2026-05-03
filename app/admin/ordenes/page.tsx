"use client"
// app/admin/ordenes/page.tsx — US011: Confirmación de PedidoEntity

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .order-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .order-header {
    padding: 40px 48px 32px;
    border-bottom: 1px solid #2A2620;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    animation: fadeDown 0.5s ease both;
  }

  .order-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 8px;
  }

  .order-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    line-height: 1;
  }

  .order-title em { font-style: italic; font-weight: 400; color: #C17A3A; }

  .order-stats {
    display: flex;
    gap: 32px;
    font-size: 12px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-number {
    font-size: 24px;
    font-weight: 700;
    color: #C17A3A;
  }

  .stat-label {
    color: #7A7268;
    letter-spacing: 0.08em;
    margin-top: 4px;
  }

  .orders-container {
    padding: 40px 48px;
    animation: fadeUp 0.5s 0.1s ease both;
  }

  .orders-grid {
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }

  .order-card {
    background: #1A1714;
    border: 1px solid #2A2620;
    padding: 24px;
    animation: scaleIn 0.3s ease both;
    position: relative;
  }

  .order-card.pending { border-left: 4px solid #C17A3A; }
  .order-card.confirmed { border-left: 4px solid #4CAF70; }
  .order-card.preparing { border-left: 4px solid #FFD700; }
  .order-card.ready { border-left: 4px solid #1976D2; }
  .order-card.completed { border-left: 4px solid #4CAF70; }
  .order-card.cancelled { border-left: 4px solid #C04040; }

  .order-header-row {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 16px;
  }

  .order-id {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
  }

  .order-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 10px;
    border: 1px solid;
    border-radius: 3px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .status-pending { border-color: #C17A3A; color: #C17A3A; }
  .status-confirmed { border-color: #4CAF70; color: #4CAF70; }
  .status-preparing { border-color: #FFD700; color: #FFD700; }
  .status-ready { border-color: #1976D2; color: #1976D2; }
  .status-completed { border-color: #4CAF70; color: #4CAF70; }
  .status-cancelled { border-color: #C04040; color: #C04040; }

  .order-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
    padding: 16px 0;
    border-top: 1px solid #2A2620;
    border-bottom: 1px solid #2A2620;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }

  .detail-label { color: #7A7268; }
  .detail-value { font-weight: 500; color: #F2EDE4; }

  .order-total {
    font-size: 24px;
    font-weight: 700;
    color: #C17A3A;
    text-align: right;
    margin-bottom: 16px;
  }

  .order-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .btn {
    flex: 1;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 10px 12px;
    border: 1px solid;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
    min-width: 80px;
  }

  .btn-confirm {
    border-color: #C17A3A;
    color: #C17A3A;
  }

  .btn-confirm:hover {
    background: #C17A3A;
    color: #111010;
  }

  .btn-confirm:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-preparing {
    border-color: #FFD700;
    color: #FFD700;
  }

  .btn-preparing:hover {
    background: #FFD700;
    color: #111010;
  }

  .btn-ready {
    border-color: #1976D2;
    color: #1976D2;
  }

  .btn-ready:hover {
    background: #1976D2;
    color: #F2EDE4;
  }

  .btn-cancel {
    border-color: #C04040;
    color: #C04040;
  }

  .btn-cancel:hover {
    background: #C04040;
    color: #111010;
  }

  .toast {
    position: fixed;
    bottom: 32px;
    right: 32px;
    padding: 14px 24px;
    font-size: 13px;
    letter-spacing: 0.06em;
    z-index: 200;
    animation: slideToast 0.3s ease both;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .toast.success { background: #1A3A24; border: 1px solid #2A6A3A; color: #4CAF70; }
  .toast.error { background: #3A1A1A; border: 1px solid #6A2A2A; color: #C04040; }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 16px;
    color: #7A7268;
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 2px solid #2A2620;
    border-top-color: #C17A3A;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes fadeDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
  @keyframes slideToast { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 700px) {
    .order-header { padding: 32px 20px 24px; flex-direction: column; gap: 8px; }
    .orders-container { padding: 24px 20px; }
    .orders-grid { grid-template-columns: 1fr; }
  }

  .order-items-section {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #2A2620;
  }

  .items-label {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #7A7268;
    margin-bottom: 12px;
    display: block;
  }

  .items-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #F2EDE4;
  }

  .item-qty {
    color: #C17A3A;
    font-weight: 700;
    margin-right: 8px;
  }

  .item-name {
    flex: 1;
    font-weight: 400;
  }

  .item-price {
    color: #7A7268;
    font-size: 12px;
  }

  .order-note-container {
    background: rgba(193, 122, 58, 0.05);
    border: 1px dashed #C17A3A;
    padding: 12px;
    margin-bottom: 16px;
    border-radius: 2px;
  }

  .note-label {
    font-size: 9px;
    letter-spacing: 0.1em;
    color: #C17A3A;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 4px;
    display: block;
  }

  .note-text {
    font-size: 13px;
    font-style: italic;
    color: #D1C7BC;
    line-height: 1.4;
  }
`
type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
}

type Order = {
  id: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  total_amount: number;
  created_at: string;
  customer_id: number;
  restaurant_id: number;
  note?: string;      // 👈 Nueva
  items: OrderItem[]; // 👈 Nueva
}
type Toast = { msg: string; type: "success" | "error" } | null

export default function AdminOrdenesPage() {
  const router = useRouter() 
  const [authorized, setAuthorized] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<Toast>(null)
  const [processing, setProcessing] = useState<number | null>(null)

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/pending?restaurantId=1");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carga inicial
    fetchOrders();

    // US004: Dashboard Chef con Polling cada 10 segundos
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleConfirm(order: Order) {
    setProcessing(order.id)
    try {
      const res = await fetch(`/api/orders/${order.id}/confirm`, { method: "POST" })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setOrders(os => os.map(o => 
        o.id === order.id 
          ? { ...o, ...updated } // Conserva lo que tiene 'o' (items, note) y sobrescribe con 'updated' (nuevo status)
          : o
      ));
      showToast(`PedidoEntity #${order.id} confirmado correctamente`, "success")
    } catch {
      showToast(`Error al confirmar el pedido #${order.id}`, "error")
    } finally {
      setProcessing(null)
    }
  }

  async function handleStatusChange(order: Order, newStatus: string) {
    setProcessing(order.id)
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setOrders(os => os.map(o => 
        o.id === order.id 
          ? { ...o, ...updated } // Conserva lo que tiene 'o' (items, note) y sobrescribe con 'updated' (nuevo status)
          : o
      ));
      showToast(`PedidoEntity #${order.id} actualizado a ${newStatus}`, "success")
    } catch {
      showToast(`Error al actualizar el pedido #${order.id}`, "error")
    } finally {
      setProcessing(null)
    }
  }

  const stats = {
    pending: orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    preparing: orders.filter(o => o.status === 'PREPARING').length,
    ready: orders.filter(o => o.status === 'READY').length,
  }

  useEffect(() => {
    // 🛡️ Guardia de seguridad
    const role = sessionStorage.getItem('userRole');
    if (role !== 'admin' && role !== 'restaurant_admin') {
      router.replace('/login');
    } else {
      setAuthorized(true);
      // Aquí puedes disparar tus fetch iniciales
    }
  }, [router]);

  if (!authorized) return null; // 👈 Evita el parpadeo de contenido

  return (
    <>
      <p>userRole: {sessionStorage.getItem('userRole')}</p>
      <style>{styles}</style>
      <div className="order-root">
        {/* Header */}
        <header className="order-header">
          <div>
            <p className="order-label">Panel de Administración</p>
            <h1 className="order-title">Gestión de <em>Pedidos</em></h1>
          </div>
          <div className="order-stats">
            <div className="stat">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat">
              <span className="stat-number">{stats.confirmed}</span>
              <span className="stat-label">Confirmados</span>
            </div>
            <div className="stat">
              <span className="stat-number">{stats.preparing}</span>
              <span className="stat-label">Preparando</span>
            </div>
            <div className="stat">
              <span className="stat-number">{stats.ready}</span>
              <span className="stat-label">Listos</span>
            </div>
          </div>
        </header>

        {/* Orders */}
        <div className="orders-container">
          {loading ? (
            <div className="loading">
              <div className="spinner" />
              Cargando pedidos…
            </div>
          ) : orders.length === 0 ? (
            <div className="loading">
              <p>No hay pedidos para procesar</p>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map(order => (
               <div key={order.id} className={`order-card ${order.status.toLowerCase()}`}>
                <div className="order-header-row">
                  <div className="order-id">PedidoEntity #{order.id}</div>
                  <span className={`order-status status-${order.status.toLowerCase()}`}>
                    <span className="status-dot" />
                    {order.status}
                  </span>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="detail-label">Cliente ID:</span>
                    <span className="detail-value">{order.customer_id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Hora:</span>
                    <span className="detail-value">
                      {new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(order.created_at))}
                    </span>
                  </div>
                </div>

                {/* SECCIÓN DE PRODUCTOS */}
                <div className="order-items-section">
                  <span className="items-label">Comanda de Cocina</span>
                  <ul className="items-list">
                    {order.items && order.items.map((item, idx) => (
                      <li key={idx} className="item-row">
                        <div>
                          <span className="item-qty">{item.quantity}x</span>
                          <span className="item-name">{item.product_name}</span>
                        </div>
                        <span className="item-price">${Number(item.unit_price).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* SECCIÓN DE NOTAS */}
                {order.note && (
                  <div className="order-note-container">
                    <span className="note-label">Instrucciones Especiales</span>
                    <p className="note-text">"{order.note}"</p>
                  </div>
                )}

                <div className="order-total">${Number(order.total_amount).toFixed(2)}</div>

                  <div className="order-actions">
                    {order.status === 'PENDING' && (
                      <button
                        className="btn btn-confirm"
                        onClick={() => handleConfirm(order)}
                        disabled={processing === order.id}
                      >
                        {processing === order.id ? "…" : "Confirmar"}
                      </button>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button
                        className="btn btn-preparing"
                        onClick={() => handleStatusChange(order, 'PREPARING')}
                        disabled={processing === order.id}
                      >
                        {processing === order.id ? "…" : "Preparando"}
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        className="btn btn-ready"
                        onClick={() => handleStatusChange(order, 'READY')}
                        disabled={processing === order.id}
                      >
                        {processing === order.id ? "…" : "Listo"}
                      </button>
                    )}
               {/*     {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                      <button
                        className="btn btn-cancel"
                        onClick={() => handleStatusChange(order, 'CANCELLED')}
                        disabled={processing === order.id}
                      >
                        {processing === order.id ? "…" : "Cancelar"}
                      </button>
                    )}
              */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : '✕'}</span>
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
    </>
  )
}