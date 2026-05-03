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


export default function KitchenPage() {
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
    loadOrders()
  }, [])

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
      
      // ✅ Actualizar estado local (status + nombre del repartidor)
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
      <style>{pageStyles}</style>
      <style>{assignStyles}</style>
      <main className="kitchen-shell">
        <div className="kitchen-wrap">
          <header className="kitchen-header">
            <div>
              <div className="kitchen-eyebrow">Asignacion de repartidores</div>
              <h1 className="kitchen-title">Pedidos activos</h1>
              <p className="kitchen-copy">
                Pedidos con sus productos y las notas especiales del cliente para ser asignados a un repartidor.
              </p>
            </div>
            <button className="refresh-btn" onClick={loadOrders} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </header>

          {error && <div className="empty-kitchen">{error}</div>}

          {!error && loading ? (
            <div className="empty-kitchen">Cargando pedidos de cocina a repartidores...</div>
          ) : !error && orders.length === 0 ? (
            <div className="empty-kitchen">No hay pedidos listos para asignar.</div>
          ) : (
            <section className="orders-grid">
              {orders.map((order) => (
                <article className="kitchen-ticket" key={order.id}>
                  <div className="ticket-head">
                    <div>
                      <div className="ticket-id">PedidoEntity #{order.id}</div>
                      <div className="ticket-meta">
                        {order.customer_name ?? "Cliente"} · ${Number(order.total_amount).toFixed(2)}
                      </div>
                    </div>
                    <span className="status-pill">{statusLabels[order.status] ?? order.status}</span>
                  </div>

                  <ul className="items-list">
                    {order.items.length === 0 ? (
                      <li className="ticket-meta">Sin detalle de productos registrado.</li>
                    ) : (
                      order.items.map((item, index) => (
                        <li className="item-row" key={`${order.id}-${item.product_name}-${index}`}>
                          <span>{item.product_name}</span>
                          <strong>x{item.quantity}</strong>
                        </li>
                      ))
                    )}
                  </ul>

                  <div className="note-box">
                    <span className="note-label">Nota especial</span>
                    <p className="note-text">{order.note || "Sin notas especiales"}</p>
                  </div>

                  {/* ✅ Mostrar repartidor si ya está asignado */}
                  {order.deliveryman_name && (
                    <div className="deliveryman-info">
                      RepartidorEntity: {order.deliveryman_name}
                    </div>
                  )}

                  {/* Botón de asignación automática US012 */}
                  {order.status === 'READY' && (
                    <div className="ticket-actions">
                      <button
                        className="assign-btn"
                        onClick={() => handleAssign(order.id)}
                        disabled={assigningOrderId === order.id}
                      >
                        {assigningOrderId === order.id ? 'Asignando...' : 'Asignar repartidor'}
                      </button>
                      {assignError && <p className="assign-error">{assignError}</p>}
                    </div>
                  )}
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  )
}
