"use client"
import { useEffect, useState } from "react"

interface OrderItem {
  id: number
  status: string
  total_amount: string
  created_at: string
  customer_id: number
}

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  .confirmation-root {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .confirmation-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    max-width: 500px;
    width: 100%;
    padding: 40px;
    text-align: center;
    animation: slideDown 0.6s ease;
  }
  
  .success-icon {
    font-size: 80px;
    margin-bottom: 20px;
  }
  
  .confirmation-title {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .confirmation-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 24px;
    line-height: 1.6;
  }
  
  .order-details {
    background: #f3f4f6;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    text-align: left;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 14px;
  }
  
  .detail-row:last-child {
    margin-bottom: 0;
    padding-top: 12px;
    border-top: 1px solid #d1d5db;
    font-weight: 700;
  }
  
  .detail-label {
    color: #6b7280;
  }
  
  .detail-value {
    color: #1f2937;
    font-weight: 600;
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .btn {
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.5px;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  .btn-secondary {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
  }
  
  .btn-secondary:hover {
    background: #f9fafb;
  }
  
  .note {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 16px;
    line-height: 1.6;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .loading {
    font-size: 16px;
    color: white;
  }
`

interface LastOrder {
  id: number
  status: string
  total_amount: string
  created_at: string
}

export default function ConfirmationPage(){
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLastOrder()
  }, [])

  const fetchLastOrder = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        const orders = Array.isArray(data) ? data : data.rows || []
        if (orders.length > 0) {
          setLastOrder(orders[0])
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const formatter = new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: undefined
    })
    return formatter.format(date)
  }

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="confirmation-root">
          <div className="loading">Cargando confirmación...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="confirmation-root">
        <div className="confirmation-card">
          <div className="success-icon">✅</div>
          <h1 className="confirmation-title">¡Pedido Confirmado!</h1>
          <p className="confirmation-subtitle">
            Tu orden ha sido recibida y está siendo preparada.
          </p>

          {lastOrder && (
            <div className="order-details">
              <div className="detail-row">
                <span className="detail-label">Número de Orden:</span>
                <span className="detail-value">#{lastOrder.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Hora:</span>
                <span className="detail-value">{formatDate(lastOrder.created_at)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estado:</span>
                <span className="detail-value">{lastOrder.status || 'PENDIENTE'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total:</span>
                <span className="detail-value">${Number(lastOrder.total_amount).toFixed(2)} MXN</span>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={() => window.location.href = '/orders'}>
              Ver Mis Órdenes
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/menu'}>
              Hacer Otro Pedido
            </button>
          </div>

          <div className="note">
            <strong>📍 Nota:</strong> Recibirás una notificación cuando tu pedido esté listo para entrega.
            Puedes seguir el estado de tu orden en la sección "Mis Órdenes".
          </div>
        </div>
      </div>
    </>
  )
}
