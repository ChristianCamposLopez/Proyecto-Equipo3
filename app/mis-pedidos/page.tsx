// app/restaurantes/mis-pedidos/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';

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

  /* Section title */
  .menu-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    margin: 48px 48px 24px;
    letter-spacing: -0.01em;
    color: #F2EDE4;
  }

  /* Grid */
  .menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1px;
    background: #1E1C19;
    padding: 0;
    margin: 0 0 24px 0;
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
    text-decoration: none;
    color: inherit;
  }

  .product-card:hover { background: #161411; }

  .product-card:hover .card-img { transform: scale(1.04); }

  .card-img-wrap {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
    background: #1A1714;
    min-height: 200px; /* Altura mínima asegurada */
  }

  .card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  /* Estilos mejorados para el placeholder de imagen */
  .card-no-img {
    width: 100%;
    height: 100%;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: linear-gradient(135deg, #1A1714 0%, #131110 100%);
    color: #4A4540;
  }

  .card-no-img svg { 
    width: 48px;
    height: 48px;
    stroke: #5A5550;
    stroke-width: 1.2;
    opacity: 0.6;
  }

  .card-no-img span {
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.5;
    color: #8A8580;
    font-weight: 300;
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
    z-index: 10;
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
    .menu-section-title { margin: 32px 24px 16px; font-size: 24px; }
    .menu-footer { padding: 20px 24px; flex-direction: column; gap: 8px; }
  }
`;

// 🔥 Actualizamos el tipo Order
type Order = {
  id: number;
  customer_id: number;
  restaurant_id: number;
  status: string;           // estado en pedido_historial (COMPLETED, CANCELLED, REFUNDED, etc.)
  total_amount: string;
  created_at: string;
  refund_rejection_reason?: string | null;
  is_active: boolean;       // true si existe en orders
  active_status: string | null; // estado real en orders (PENDING, CONFIRMED, PREPARING, READY)
};

export default function MisPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prevActiveStatusRef = useRef<Map<number, string | null>>(new Map());

  const ordersRef = useRef(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/pedidos');
        const data = await res.json();
        const pedidos = data.pedidos || [];
        setOrders(pedidos);
        
        const prevMap = new Map();
        pedidos.forEach((order: Order) => {
          prevMap.set(order.id, order.active_status);
        });
        prevActiveStatusRef.current = prevMap;
      } catch (err) {
        setError('No se pudieron cargar los pedidos');
      } finally {
        setLoading(false);
      }
    };

    loadInitial();

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/pedidos');
        const data = await res.json();
        const newOrders = data.pedidos || [];
        
        // 1. 🔥 COMPARA CON LA REF (Para evitar el parpadeo si no hay cambios)
        if (JSON.stringify(newOrders) !== JSON.stringify(ordersRef.current)) {
          
          // 2. Detectar cambios para alertas
          newOrders.forEach((newOrder: Order) => {
            const prevActiveStatus = prevActiveStatusRef.current.get(newOrder.id);
            const currentActiveStatus = newOrder.active_status;
            
            if (prevActiveStatus !== currentActiveStatus) {
              if (currentActiveStatus === 'CONFIRMED') {
                alert(`✅ Pedido #${newOrder.id} ha sido confirmado`);
              }
              prevActiveStatusRef.current.set(newOrder.id, currentActiveStatus);
            }
          });

          // 3. Actualizar el estado real
          setOrders(newOrders);
        }
      } catch (err) {
        console.error('Error en polling:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []); // [] está bien aquí porque usamos refs para los datos cambiantes

  /*const fetchOrders = async () => {
    try {
      const res = await fetch('/api/pedidos');
      const data = await res.json();
      setOrders(data.pedidos || []);
    } catch (err) {
      setError('No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  }; */

  /*useEffect(() => {
    fetchOrders();
  }, []); */

  const handleComplete = async (orderId: number) => {
    setCompletingId(orderId);
    setError(null);
    try {
      const res = await fetch(`/api/pedidos/${orderId}/complete`, { method: 'PUT' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al completar');
      }
      // Actualizar estado local: ya no está activo, cambiar status a COMPLETED
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, status: 'COMPLETED', is_active: false, active_status: null }
            : order
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCompletingId(null);
    }
  };

  const handleCancel = async (orderId: number) => {
    setCancellingId(orderId);
    setError(null);
    try {
      const res = await fetch(`/api/pedidos/${orderId}/cancel`, { method: 'PUT' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al cancelar');
      }
      const data = await res.json();
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, status: 'CANCELLED', is_active: false, active_status: null, refund_rejection_reason: null }
            : order
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('es-MX');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'COMPLETADO';
      case 'CANCELLED': return 'CANCELADO (reembolso pendiente)';
      case 'REFUNDED': return 'REEMBOLSADO';
      case 'REFUND_REJECTED': return 'REEMBOLSO RECHAZADO';
      default: return 'PENDIENTE';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#1E3A2F';
      case 'CANCELLED': return '#3A1E1E';
      case 'REFUNDED': return '#1E3A2F';
      case 'REFUND_REJECTED': return '#5C2E2E';
      default: return '#2A2A1E';
    }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="menu-root">
          <div className="menu-loading">
            <div className="loader-ring" />
            Cargando pedidos…
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="menu-root">
        <header className="menu-hero">
          <p className="menu-label">Historial</p>
          <h1 className="menu-title">
            Mis <em>pedidos</em>
          </h1>
          <p className="menu-subtitle">
            Revisa el estado de tus órdenes.
          </p>
        </header>

        {error && (
          <div style={{ background: '#3A1E1E', margin: '24px 48px', padding: '12px', borderRadius: '8px', color: '#F2EDE4' }}>
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="menu-empty">Aún no has realizado ningún pedido.</div>
        ) : (
          <div style={{ margin: '24px 48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(order => (
                <div
                  key={order.id}
                  style={{
                    background: '#1A1714',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #2A2620',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 'bold' }}>
                      Pedido #{order.id}
                    </div>
                    <div style={{ fontSize: '14px', color: '#7A7268', marginTop: '4px' }}>
                      {formatDate(order.created_at)}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <span
                        style={{
                          background: getStatusColor(order.status),
                          padding: '4px 12px',
                          borderRadius: '40px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#F2EDE4',
                        }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    {order.status === 'REFUND_REJECTED' && order.refund_rejection_reason && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#E5A1A1', background: '#3A1E1E', padding: '8px', borderRadius: '8px' }}>
                        Motivo del rechazo: {order.refund_rejection_reason}
                      </div>
                    )}
                    {order.status === 'CANCELLED' && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#C17A3A' }}>
                        Tu solicitud de reembolso está pendiente. El administrador la procesará pronto.
                      </div>
                    )}
                    <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 'bold' }}>
                      ${Number(order.total_amount).toFixed(2)} MXN
                    </div>
                  </div>

                  {/* 🔥 CONDICIÓN MODIFICADA: solo si está activo y el estado activo es PENDING o CONFIRMED */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {order.is_active && order.active_status !== 'COMPLETED' && (order.active_status === 'PENDING' || order.active_status === 'CONFIRMED' || order.active_status === 'DELIVERED') && (
                      <>
                        {/*<button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancellingId === order.id}
                          style={{
                            background: 'transparent',
                            border: '1px solid #C17A3A',
                            color: '#C17A3A',
                            padding: '8px 20px',
                            borderRadius: '40px',
                            fontWeight: 'bold',
                            cursor: cancellingId === order.id ? 'not-allowed' : 'pointer',
                            opacity: cancellingId === order.id ? 0.6 : 1,
                          }}
                        >
                          {cancellingId === order.id ? 'Cancelando…' : 'Cancelar pedido'}
                        </button> */}
                        <button
                          onClick={() => handleComplete(order.id)}
                          disabled={completingId === order.id}
                          style={{
                            background: '#C17A3A',
                            border: 'none',
                            color: '#111010',
                            padding: '8px 20px',
                            borderRadius: '40px',
                            fontWeight: 'bold',
                            cursor: completingId === order.id ? 'not-allowed' : 'pointer',
                            opacity: completingId === order.id ? 0.6 : 1,
                          }}
                        >
                          {completingId === order.id ? 'Actualizando…' : 'Marcar como completado'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="menu-footer">
          <span>Estado actualizado en tiempo real</span>
          <span>{orders.length} pedido(s)</span>
        </footer>
      </div>
    </>
  );
}