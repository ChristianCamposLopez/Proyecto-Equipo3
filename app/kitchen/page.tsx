"use client"

import { useEffect, useState } from "react"

type KitchenOrderItem = {
  product_name: string
  quantity: number
  unit_price: number
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
  PREPARING: "En preparacion",
  READY: "Listo",
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

async function readJsonResponse(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error("El servidor devolvio una respuesta no valida")
  }
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/kitchen/orders")
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

  return (
    <>
      <style>{pageStyles}</style>
      <main className="kitchen-shell">
        <div className="kitchen-wrap">
          <header className="kitchen-header">
            <div>
              <div className="kitchen-eyebrow">US007 · Cocina</div>
              <h1 className="kitchen-title">Pedidos activos</h1>
              <p className="kitchen-copy">
                Revisa cada pedido con sus productos y las notas especiales del cliente antes de iniciar la preparacion.
              </p>
            </div>
            <button className="refresh-btn" onClick={loadOrders} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </header>

          {error && <div className="empty-kitchen">{error}</div>}

          {!error && loading ? (
            <div className="empty-kitchen">Cargando pedidos de cocina...</div>
          ) : !error && orders.length === 0 ? (
            <div className="empty-kitchen">No hay pedidos activos para cocina.</div>
          ) : (
            <section className="orders-grid">
              {orders.map((order) => (
                <article className="kitchen-ticket" key={order.id}>
                  <div className="ticket-head">
                    <div>
                      <div className="ticket-id">Pedido #{order.id}</div>
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
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  )
}
