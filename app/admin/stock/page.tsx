"use client"
// app/admin/stock/page.tsx — US008: Gestión de Stock

import { useEffect, useState } from "react"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .stock-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .stock-header {
    padding: 40px 48px 32px;
    border-bottom: 1px solid #2A2620;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    animation: fadeDown 0.5s ease both;
  }

  .stock-label { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #C17A3A; margin-bottom: 8px; }
  .stock-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; line-height: 1; }
  .stock-title em { font-style: italic; font-weight: 400; color: #C17A3A; }

  .stock-stats { display: flex; gap: 24px; }
  .stat { display: flex; flex-direction: column; align-items: center; }
  .stat-number { font-size: 28px; font-weight: 700; color: #C17A3A; }
  .stat-label { font-size: 11px; color: #7A7268; letter-spacing: 0.08em; margin-top: 4px; }

  .content { padding: 40px 48px; }

  .alerts-section { margin-bottom: 48px; }
  .section-title { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #F2EDE4; }

  .alerts-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
  
  .alert-card {
    background: #1A1714;
    border: 1px solid #2A2620;
    padding: 16px;
    border-left: 4px solid;
  }

  .alert-card.out-of-stock { border-left-color: #C04040; }
  .alert-card.low-stock { border-left-color: #FFD700; }

  .alert-name { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
  .alert-stock { font-size: 12px; color: #7A7268; margin-bottom: 4px; }
  .alert-actions { display: flex; gap: 8px; margin-top: 12px; }

  .btn-small {
    flex: 1;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 8px 12px;
    border: 1px solid;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
  }

  .btn-restock { border-color: #C17A3A; color: #C17A3A; }
  .btn-restock:hover { background: #C17A3A; color: #111010; }

  .table-container { overflow-x: auto; }

  .products-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
  }

  .products-table th {
    padding: 12px;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #7A7268;
    font-weight: 400;
    text-align: left;
    border-bottom: 1px solid #2A2620;
  }

  .products-table td {
    padding: 12px;
    border-bottom: 1px solid #1E1C19;
    font-size: 13px;
  }

  .product-name { font-weight: 500; }
  .status-badge { display: inline-block; padding: 4px 8px; border-radius: 2px; font-size: 10px; }
  .status-in-stock { background: #1A3A24; color: #4CAF70; }
  .status-low-stock { background: #3A2A1A; color: #FFD700; }
  .status-out-of-stock { background: #3A1A1A; color: #C04040; }

  .stock-input { width: 60px; padding: 4px 8px; background: #1A1714; border: 1px solid #2A2620; color: #F2EDE4; }

  .modal { position: fixed; inset: 0; background: #111010CC; backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal-content { background: #1A1714; border: 1px solid #2A2620; padding: 32px; max-width: 400px; width: 90%; }
  .modal-title { font-size: 20px; font-weight: 600; margin-bottom: 16px; }
  .modal-input { width: 100%; padding: 10px; background: #111010; border: 1px solid #2A2620; color: #F2EDE4; margin-bottom: 16px; }
  .modal-buttons { display: flex; gap: 12px; }
  .btn { flex: 1; padding: 10px; border: 1px solid #C17A3A; color: #C17A3A; cursor: pointer; background: transparent; }
  .btn:hover { background: #C17A3A; color: #111010; }

  .loading { display: flex; align-items: center; justify-content: center; min-height: 300px; gap: 16px; color: #7A7268; }
  .spinner { width: 28px; height: 28px; border: 2px solid #2A2620; border-top-color: #C17A3A; border-radius: 50%; animation: spin 0.8s linear infinite; }

  @keyframes fadeDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 700px) {
    .stock-header { flex-direction: column; gap: 8px; }
    .stock-stats { flex-wrap: wrap; }
    .products-table { font-size: 12px; }
  }
`

type ProductoEntity = {
  id: number
  name: string
  stock_quantity: number
  is_available: boolean
  low_stock_threshold: number
  deleted_at?: string | null  // <-- agrega esta línea
}

type Alert = {
  product_id: number
  name: string
  current_stock: number
  threshold: number
  status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'NORMAL'
}

type Summary = {
  total_products: number
  in_stock: number
  low_stock: number
  out_of_stock: number
}

export default function AdminStockPage() {
  const [products, setProducts] = useState<ProductoEntity[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingProductoEntity, setEditingProductoEntity] = useState<number | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(0)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [productsRes, alertsRes, summaryRes] = await Promise.all([
        fetch('/api/menu/products'),
        fetch('/api/products/stock/alerts?restaurantId=1'),
        fetch('/api/products/stock/summary?restaurantId=1')
      ])

      if (productsRes.ok) {
        const data = await productsRes.json();
        const activeProducts = Array.isArray(data)
          ? data.filter((p: any) => !p.deleted_at)
          : [];
        setProducts(activeProducts);
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json()
        setAlerts(Array.isArray(data) ? data : [])
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json()
        setSummary(data)
      }

    } catch (e) {
      console.error('Error fetching data:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleStockChange(productId: number) {
    try {
      const res = await fetch(`/api/products/${productId}/stock/update`, {
        method: 'POST',
        body: JSON.stringify({ quantity: editQuantity })
      })

      if (res.ok) {
        setEditingProductoEntity(null)
        fetchData()
      }
    } catch (e) {
      console.error('Error updating stock:', e)
    }
  }

  async function handleRestock(productId: number) {
    try {
      const res = await fetch(`/api/products/${productId}/stock/add`, {
        method: 'POST',
        body: JSON.stringify({ quantity: 20 })
      })

      if (res.ok) {
        fetchData()
      }
    } catch (e) {
      console.error('Error restocking:', e)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="stock-root">
        <header className="stock-header">
          <div>
            <p className="stock-label">Panel de Administración</p>
            <h1 className="stock-title">Gestión de <em>Stock</em></h1>
          </div>
          {summary && (
            <div className="stock-stats">
              <div className="stat">
                <span className="stat-number">{summary.total_products}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat">
                <span className="stat-number">{summary.in_stock}</span>
                <span className="stat-label">En Stock</span>
              </div>
              <div className="stat">
                <span className="stat-number">{summary.low_stock}</span>
                <span className="stat-label">Stock Bajo</span>
              </div>
              <div className="stat">
                <span className="stat-number">{summary.out_of_stock}</span>
                <span className="stat-label">Agotados</span>
              </div>
            </div>
          )}
        </header>

        <div className="content">
          {loading ? (
            <div className="loading">
              <div className="spinner" />
              Cargando inventario…
            </div>
          ) : (
            <>
              {/* Alertas */}
              {alerts.length > 0 && (
                <div className="alerts-section">
                  <h2 className="section-title">⚠️ Alertas de Stock</h2>
                  <div className="alerts-grid">
                    {alerts.map(alert => (
                      <div key={alert.product_id} className={`alert-card ${alert.status === 'OUT_OF_STOCK' ? 'out-of-stock' : 'low-stock'}`}>
                        <div className="alert-name">{alert.name}</div>
                        <div className="alert-stock">Stock: {alert.current_stock} / Mínimo: {alert.threshold}</div>
                        <div className="alert-actions">
                          <button className="btn-small btn-restock" onClick={() => handleRestock(alert.product_id)}>
                            +20 Unidades
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabla de productos */}
              <div className="table-container">
                <h2 className="section-title">Inventario Completo</h2>
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Stock</th>
                      <th>Mínimo</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => {
                      let statusClass = 'status-in-stock'
                      let statusText = 'Normal'
                      if (product.stock_quantity === 0) {
                        statusClass = 'status-out-of-stock'
                        statusText = 'Agotado'
                      } else if (product.stock_quantity <= product.low_stock_threshold) {
                        statusClass = 'status-low-stock'
                        statusText = 'Stock Bajo'
                      }

                      return (
                        <tr key={product.id}>
                          <td className="product-name">{product.name}</td>
                          <td>{product.stock_quantity}</td>
                          <td>{product.low_stock_threshold}</td>
                          <td>
                            <span className={`status-badge ${statusClass}`}>{statusText}</span>
                          </td>
                          <td>
                            <button className="btn-small btn-restock" onClick={() => {
                              setEditingProductoEntity(product.id)
                              setEditQuantity(product.stock_quantity)
                            }}>
                              Editar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Modal de edición */}
        {editingProductoEntity && (
          <div className="modal" onClick={() => setEditingProductoEntity(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Actualizar Stock</h2>
              <input
                type="number"
                className="modal-input"
                value={editQuantity ?? 0}
                onChange={e => setEditQuantity(parseInt(e.target.value) || 0)}
                min="0"
              />
              <div className="modal-buttons">
                <button className="btn" onClick={() => handleStockChange(editingProductoEntity)}>Guardar</button>
                <button className="btn" style={{borderColor: '#7A7268', color: '#7A7268'}} onClick={() => setEditingProductoEntity(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
