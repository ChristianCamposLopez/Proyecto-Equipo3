"use client"
import { useEffect, useState } from "react"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .db-root {
    min-height: 100vh;
    background: #F5F0E8;
    font-family: 'DM Mono', monospace;
    color: #1A1612;
    padding: 48px 40px;
  }

  .db-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 48px;
    border-bottom: 2px solid #1A1612;
    padding-bottom: 20px;
    animation: slideDown 0.6s ease both;
  }

  .db-title-block {}

  .db-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #7A6F5E;
    margin-bottom: 6px;
  }

  .db-title {
    font-family: 'Fraunces', serif;
    font-size: 42px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .db-title em {
    font-style: italic;
    font-weight: 300;
    color: #7A6F5E;
  }

  .db-date {
    font-size: 11px;
    letter-spacing: 0.1em;
    color: #7A6F5E;
    text-align: right;
    line-height: 1.7;
  }

  .db-csv-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: 1.5px solid #1A1612;
    background: transparent;
    color: #1A1612;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    margin-top: 16px;
  }

  .db-csv-btn:hover {
    background: #1A1612;
    color: #F5F0E8;
  }

  .db-csv-btn svg {
    transition: transform 0.2s;
  }

  .db-csv-btn:hover svg {
    transform: translateY(2px);
  }

  /* KPI Cards */
  .db-kpi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    margin-bottom: 40px;
    background: #1A1612;
    border: 2px solid #1A1612;
    animation: fadeIn 0.6s 0.1s ease both;
  }

  .db-kpi-card {
    background: #F5F0E8;
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .db-kpi-label {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #7A6F5E;
  }

  .db-kpi-value {
    font-family: 'Fraunces', serif;
    font-size: 36px;
    font-weight: 700;
    line-height: 1;
  }

  .db-kpi-sub {
    font-size: 10px;
    color: #7A6F5E;
    letter-spacing: 0.06em;
  }

  /* Table */
  .db-table-wrap {
    animation: fadeIn 0.6s 0.2s ease both;
  }

  .db-table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .db-section-title {
    font-family: 'Fraunces', serif;
    font-size: 18px;
    font-weight: 300;
    font-style: italic;
    color: #7A6F5E;
  }

  .db-count {
    font-size: 11px;
    letter-spacing: 0.1em;
    color: #7A6F5E;
  }

  table.db-table {
    width: 100%;
    border-collapse: collapse;
    border: 2px solid #1A1612;
  }

  .db-table thead tr {
    border-bottom: 2px solid #1A1612;
    background: #1A1612;
  }

  .db-table th {
    padding: 12px 20px;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    text-align: left;
    color: #F5F0E8;
    font-weight: 500;
  }

  .db-table th:not(:first-child) {
    text-align: right;
  }

  .db-table td {
    padding: 16px 20px;
    font-size: 13px;
    border-bottom: 1px solid #D8D0C0;
    vertical-align: middle;
  }

  .db-table td:not(:first-child) {
    text-align: right;
  }

  .db-table tbody tr {
    transition: background 0.15s;
    opacity: 0;
    animation: rowIn 0.4s ease forwards;
  }

  .db-table tbody tr:hover {
    background: #EDE7D8;
  }

  .db-table tbody tr:last-child td {
    border-bottom: none;
  }

  .db-day {
    font-family: 'Fraunces', serif;
    font-size: 15px;
    font-weight: 700;
  }

  .db-orders-pill {
    display: inline-block;
    background: #1A1612;
    color: #F5F0E8;
    font-size: 11px;
    padding: 3px 10px;
    letter-spacing: 0.06em;
  }

  .db-money {
    font-family: 'Fraunces', serif;
    font-size: 17px;
    font-weight: 700;
  }

  .db-avg {
    color: #7A6F5E;
    font-size: 13px;
  }

  /* Bar sparkline */
  .db-bar-cell {
    width: 120px;
  }

  .db-bar-bg {
    background: #D8D0C0;
    height: 6px;
    width: 100%;
  }

  .db-bar-fill {
    height: 6px;
    background: #1A1612;
    transition: width 0.8s ease;
  }

  /* States */
  .db-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 300px;
    color: #7A6F5E;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .db-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid #D8D0C0;
    border-top-color: #1A1612;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .db-empty {
    padding: 60px 20px;
    text-align: center;
    color: #7A6F5E;
    font-family: 'Fraunces', serif;
    font-size: 20px;
    font-style: italic;
    font-weight: 300;
    border: 2px solid #D8D0C0;
  }

  /* Footer */
  .db-footer {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid #D8D0C0;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #B0A898;
    display: flex;
    justify-content: space-between;
    animation: fadeIn 0.6s 0.4s ease both;
  }

  /* Animations */
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes rowIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 700px) {
    .db-root { padding: 24px 16px; }
    .db-kpi-grid { grid-template-columns: 1fr; }
    .db-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    .db-bar-cell { display: none; }
    .db-title { font-size: 32px; }
  }
`

type Sale = {
  day: string
  total_orders: number
  total_sales: number
  average_ticket: number
}

function fmt(n: number) {
  return n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/reports/daily-sales")
      .then(res => res.json())
      .then(data => { setSales(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const totalSales   = sales.reduce((a, s) => a + s.total_sales, 0)
  const totalOrders  = sales.reduce((a, s) => a + s.total_orders, 0)
  const globalAvg    = sales.length ? totalSales / totalOrders : 0
  const maxSale      = Math.max(...sales.map(s => s.total_sales), 1)
  const today        = new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return (
    <>
      <style>{styles}</style>
      <div className="db-root">

        {/* Header */}
        <header className="db-header">
          <div className="db-title-block">
            <p className="db-eyebrow">Reporte de rendimiento</p>
            <h1 className="db-title">Dashboard <em>Ventas</em></h1>
            <a className="db-csv-btn" href="/api/reports/daily-sales/csv">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v7M3 6l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Exportar CSV
            </a>
          </div>
          <div className="db-date">
            <div>{today}</div>
            <div style={{marginTop: 4}}>{sales.length} días registrados</div>
          </div>
        </header>

        {/* KPI Cards */}
        {!loading && sales.length > 0 && (
          <div className="db-kpi-grid">
            <div className="db-kpi-card">
              <span className="db-kpi-label">Ventas totales</span>
              <span className="db-kpi-value">${fmt(totalSales)}</span>
              <span className="db-kpi-sub">acumulado del período</span>
            </div>
            <div className="db-kpi-card">
              <span className="db-kpi-label">Pedidos totales</span>
              <span className="db-kpi-value">{totalOrders.toLocaleString()}</span>
              <span className="db-kpi-sub">órdenes completadas</span>
            </div>
            <div className="db-kpi-card">
              <span className="db-kpi-label">Ticket promedio</span>
              <span className="db-kpi-value">${fmt(globalAvg)}</span>
              <span className="db-kpi-sub">por pedido</span>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="db-table-wrap">
          <div className="db-table-header">
            <span className="db-section-title">Detalle diario</span>
            {!loading && <span className="db-count">{sales.length} registros</span>}
          </div>

          {loading ? (
            <div className="db-loading">
              <div className="db-spinner" />
              Cargando datos…
            </div>
          ) : sales.length === 0 ? (
            <div className="db-empty">Sin datos disponibles</div>
          ) : (
            <table className="db-table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Pedidos</th>
                  <th>Total ventas</th>
                  <th>Promedio</th>
                  <th className="db-bar-cell" style={{textAlign:"left"}}>Volumen</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s, i) => (
                  <tr key={s.day} style={{ animationDelay: `${0.05 * i}s` }}>
                    <td><span className="db-day">{s.day}</span></td>
                    <td><span className="db-orders-pill">{s.total_orders}</span></td>
                    <td><span className="db-money">${fmt(s.total_sales)}</span></td>
                    <td><span className="db-avg">${fmt(s.average_ticket)}</span></td>
                    <td className="db-bar-cell">
                      <div className="db-bar-bg">
                        <div
                          className="db-bar-fill"
                          style={{ width: `${(s.total_sales / maxSale) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <footer className="db-footer">
          <span>Sistema de reportes</span>
          <span>Actualizado automáticamente</span>
        </footer>

      </div>
    </>
  )
}