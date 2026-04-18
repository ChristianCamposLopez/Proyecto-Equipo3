// app/admin/cocina/page.tsx
// US004: Panel de gestión de pedidos en tiempo real para cocina

"use client";

import { useEffect, useState, useCallback } from "react";

interface KitchenOrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface KitchenOrder {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
  customer_name: string;
  items: KitchenOrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; next: string; nextLabel: string }> = {
  PENDING: { label: "Pendiente", color: "#E67E22", bg: "rgba(230,126,34,0.1)", next: "PREPARING", nextLabel: "▶ Empezar a Preparar" },
  PREPARING: { label: "En Preparación", color: "#3498DB", bg: "rgba(52,152,219,0.1)", next: "READY", nextLabel: "✓ Marcar Listo" },
  READY: { label: "Listo", color: "#2ECC71", bg: "rgba(46,204,113,0.1)", next: "COMPLETED", nextLabel: "📦 Entregar" },
};

export default function CocinaPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/kitchen/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await fetch(`/api/kitchen/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchOrders();
    } catch {
      alert("Error al actualizar el estado");
    } finally {
      setUpdatingId(null);
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const getUrgencyColor = (createdAt: string) => {
    const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (mins > 30) return "#E74C3C";
    if (mins > 15) return "#E67E22";
    return "#2ECC71";
  };

  const columns = ["PENDING", "PREPARING", "READY"] as const;

  return (
    <>
      <style>{`
        .cocina-page { padding: 32px; max-width: 1400px; margin: 0 auto; animation: ckFadeIn 0.4s ease; }
        @keyframes ckFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .cocina-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .cocina-header h1 { font-size: 24px; font-weight: 700; color: #fff; margin: 0; }
        .cocina-header p { font-size: 13px; color: #555; margin: 4px 0 0; }

        .cocina-live {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #2ECC71; font-weight: 500;
        }
        .cocina-live-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #2ECC71; animation: livePulse 2s ease infinite;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .cocina-stats {
          display: flex; gap: 16px; margin-bottom: 24px;
        }
        .cocina-stat {
          padding: 8px 16px; background: #111; border: 1px solid #1e1e1e;
          border-radius: 8px; font-size: 13px; color: #888;
          display: flex; align-items: center; gap: 8px;
        }
        .cocina-stat strong { color: #fff; font-size: 16px; }

        /* Kanban */
        .kanban-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: start;
        }

        .kanban-column {
          background: #0e0e0e;
          border: 1px solid #1e1e1e;
          border-radius: 14px;
          overflow: hidden;
          min-height: 300px;
        }

        .kanban-col-header {
          padding: 16px 20px;
          border-bottom: 1px solid #1a1a1a;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .kanban-col-title {
          font-size: 13px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .kanban-col-count {
          padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;
        }

        .kanban-cards { padding: 12px; display: flex; flex-direction: column; gap: 10px; }

        .order-card {
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 10px;
          padding: 16px;
          transition: all 0.2s;
        }
        .order-card:hover { border-color: #333; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.3); }

        .order-card-top {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
        }
        .order-id { font-size: 15px; font-weight: 700; color: #fff; }
        .order-time { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; background: #1a1a1a; }

        .order-customer { font-size: 12px; color: #666; margin-bottom: 10px; }

        .order-items { margin-bottom: 12px; }
        .order-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 4px 0; font-size: 13px; color: #999;
        }
        .order-item-qty { color: #D35400; font-weight: 600; margin-right: 8px; }

        .order-total {
          padding-top: 8px; border-top: 1px solid #1a1a1a;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13px; margin-bottom: 12px;
        }
        .order-total-value { color: #D35400; font-weight: 700; font-size: 16px; }

        .order-action-btn {
          width: 100%; padding: 10px; border: none; border-radius: 8px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
          color: #fff;
        }
        .order-action-btn:hover { filter: brightness(1.2); transform: translateY(-1px); }
        .order-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .kanban-empty {
          padding: 40px 20px; text-align: center; color: #333;
          font-size: 13px;
        }

        .cocina-loading { padding: 60px 20px; text-align: center; color: #555; }

        @media (max-width: 900px) {
          .kanban-grid { grid-template-columns: 1fr; }
          .cocina-page { padding: 16px; }
        }
      `}</style>

      <div className="cocina-page">
        <div className="cocina-header">
          <div>
            <h1>🔥 Panel de Cocina</h1>
            <p>Gestión de pedidos en tiempo real</p>
          </div>
          <div className="cocina-live">
            <div className="cocina-live-dot" />
            En vivo — actualización cada 10s
          </div>
        </div>

        <div className="cocina-stats">
          {columns.map((col) => {
            const count = orders.filter((o) => o.status === col).length;
            const config = STATUS_CONFIG[col];
            return (
              <div key={col} className="cocina-stat">
                <span style={{ color: config.color }}>●</span>
                {config.label}: <strong>{count}</strong>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="cocina-loading">Cargando pedidos...</div>
        ) : (
          <div className="kanban-grid">
            {columns.map((status) => {
              const config = STATUS_CONFIG[status];
              const columnOrders = orders.filter((o) => o.status === status);
              return (
                <div key={status} className="kanban-column">
                  <div className="kanban-col-header">
                    <span className="kanban-col-title" style={{ color: config.color }}>
                      {config.label}
                    </span>
                    <span
                      className="kanban-col-count"
                      style={{ background: config.bg, color: config.color }}
                    >
                      {columnOrders.length}
                    </span>
                  </div>
                  <div className="kanban-cards">
                    {columnOrders.length === 0 ? (
                      <div className="kanban-empty">Sin pedidos</div>
                    ) : (
                      columnOrders.map((order) => (
                        <div key={order.id} className="order-card">
                          <div className="order-card-top">
                            <span className="order-id">#{order.id}</span>
                            <span
                              className="order-time"
                              style={{ color: getUrgencyColor(order.created_at) }}
                            >
                              ⏱ {getTimeElapsed(order.created_at)}
                            </span>
                          </div>
                          <div className="order-customer">
                            👤 {order.customer_name}
                          </div>
                          <div className="order-items">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item, i) => (
                                <div key={i} className="order-item">
                                  <span>
                                    <span className="order-item-qty">{item.quantity}×</span>
                                    {item.product_name}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize: 12, color: "#444" }}>
                                Sin items detallados
                              </div>
                            )}
                          </div>
                          <div className="order-total">
                            <span style={{ color: "#666" }}>Total</span>
                            <span className="order-total-value">
                              ${Number(order.total_amount).toFixed(2)}
                            </span>
                          </div>
                          <button
                            className="order-action-btn"
                            style={{ background: config.color }}
                            onClick={() => handleStatusChange(order.id, config.next)}
                            disabled={updatingId === order.id}
                          >
                            {updatingId === order.id ? "Actualizando..." : config.nextLabel}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
