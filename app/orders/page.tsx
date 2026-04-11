"use client"
import { useEffect, useState } from "react"

interface Order {
    id: number;
    status: string;
    total_amount: number;
    created_at: string;
    customer_id: number;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  .orders-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
    padding: 72px 48px 48px;
    animation: fadeIn 0.7s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .orders-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .orders-header {
    margin-bottom: 48px;
    padding-bottom: 32px;
    border-bottom: 1px solid #2A2620;
    position: relative;
  }
  
  .orders-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, #3D1F0A44, transparent);
    pointer-events: none;
  }
  
  .orders-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }
  
  .orders-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 60px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }
  
  .orders-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }
  
  .orders-subtitle {
    font-size: 14px;
    color: #7A7268;
    font-weight: 300;
    line-height: 1.6;
  }
  
  .orders-table {
    width: 100%;
    border-collapse: collapse;
    background: transparent;
    border-spacing: 0;
    animation: slideUp 0.6s ease;
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: none; }
  }
  
  .orders-table thead {
    border-top: 1px solid #2A2620;
    border-bottom: 1px solid #2A2620;
  }
  
  .orders-table th {
    padding: 20px 16px;
    text-align: left;
    font-weight: 500;
    color: #C17A3A;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  
  .orders-table td {
    padding: 20px 16px;
    border-bottom: 1px solid #1E1C19;
    color: #F2EDE4;
    font-size: 14px;
  }
  
  .orders-table tbody tr {
    transition: background 0.3s ease;
  }
  
  .orders-table tbody tr:hover {
    background: rgba(193, 122, 58, 0.08);
  }
  
  .orders-table tbody tr:last-child td {
    border-bottom: 1px solid #2A2620;
  }
  
  .status-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 2px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  
  .status-completed {
    background: rgba(193, 122, 58, 0.2);
    color: #D4A574;
  }
  
  .status-pending {
    background: rgba(193, 122, 58, 0.15);
    color: #C17A3A;
  }
  
  .status-confirmed {
    background: rgba(193, 122, 58, 0.15);
    color: #C17A3A;
  }
  
  .status-ready {
    background: rgba(193, 122, 58, 0.2);
    color: #D4A574;
  }
  
  .status-cancelled {
    background: rgba(200, 80, 80, 0.2);
    color: #E59999;
  }
  
  .action-btn {
    padding: 8px 14px;
    border: 1px solid #2A2620;
    background: transparent;
    color: #F2EDE4;
    border-radius: 2px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-right: 8px;
    font-family: 'DM Sans', sans-serif;
  }
  
  .action-btn:hover {
    background: rgba(193, 122, 58, 0.1);
    border-color: #C17A3A;
    color: #C17A3A;
  }
  
  .action-btn-cancel {
    border-color: #5A3333;
    color: #E59999;
  }
  
  .action-btn-cancel:hover {
    background: rgba(200, 80, 80, 0.1);
    border-color: #B84848;
    color: #F0B0B0;
  }
  
  .empty-state {
    text-align: center;
    padding: 80px 40px;
    color: #7A7268;
  }
  
  .empty-state p {
    font-size: 16px;
    font-weight: 300;
    line-height: 1.6;
  }
  
  .loading {
    text-align: center;
    padding: 80px 40px;
    color: #7A7268;
    font-size: 14px;
    font-weight: 300;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`

export default function OrdersPage(){

    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        fetchOrders()
    },[])

    async function fetchOrders() {
        try {
            const res = await fetch("/api/orders")
            if (res.ok) {
                const data = await res.json()
                setOrders(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const cancelOrder = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas cancelar este pedido?')) return

        try {
            const res = await fetch("/api/orders/cancel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ orderId: id })
            })

            if (res.ok) {
                alert("Pedido cancelado exitosamente")
                fetchOrders()
            } else {
                alert("Error al cancelar el pedido")
            }
        } catch (error) {
            console.error('Error canceling order:', error)
            alert("Error al cancelar el pedido")
        }
    }

    const getStatusBadgeClass = (status: string) => {
        const lowerStatus = status.toLowerCase()
        if (lowerStatus.includes('completed')) return 'status-completed'
        if (lowerStatus.includes('pending')) return 'status-pending'
        if (lowerStatus.includes('confirmed')) return 'status-confirmed'
        if (lowerStatus.includes('ready')) return 'status-ready'
        if (lowerStatus.includes('cancelled')) return 'status-cancelled'
        return 'status-pending'
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        // Usa Intl.DateTimeFormat para respetar la zona horaria del navegador
        const formatter = new Intl.DateTimeFormat('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: undefined // Usa la zona horaria del usuario
        })
        return formatter.format(date)
    }

    return (
        <>
            <style>{styles}</style>
            <div className="orders-root">
                <div className="orders-container">
                    <div className="orders-header">
                        <div className="orders-label">Tu Gestión</div>
                        <h1 className="orders-title">Mis <em>Pedidos</em></h1>
                        <p className="orders-subtitle">Visualiza y administra todas tus órdenes</p>
                    </div>

                    {loading ? (
                        <div className="loading">Cargando pedidos…</div>
                    ) : orders.length === 0 ? (
                        <div className="empty-state">
                            <p>No hay pedidos registrados</p>
                        </div>
                    ) : (
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{formatDate(order.created_at)}</td>
                                        <td>Cliente #{order.customer_id}</td>
                                        <td>${Number(order.total_amount).toFixed(2)}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            {order.status !== "CANCELLED" && (
                                                <button
                                                    className="action-btn action-btn-cancel"
                                                    onClick={() => cancelOrder(order.id)}
                                                >
                                                    Cancelar / Reembolsar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    )
}
