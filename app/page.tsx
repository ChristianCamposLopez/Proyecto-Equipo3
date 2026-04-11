"use client"
import { useEffect, useState } from "react"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .home-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
  }

  /* Header */
  .home-header {
    background: #1A1714;
    border-bottom: 1px solid #2A2620;
    padding: 20px 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: #C17A3A;
  }

  .nav-links {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  .nav-links a {
    color: #F2EDE4;
    text-decoration: none;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 8px 16px;
    border: 1px solid transparent;
    transition: all 0.2s;
  }

  .nav-links a:hover {
    border: 1px solid #C17A3A;
    color: #C17A3A;
  }

  /* Main Hero */
  .hero {
    padding: 80px 48px;
    text-align: center;
    border-bottom: 1px solid #2A2620;
  }

  .hero-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 48px;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 16px;
  }

  .hero-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .hero-subtitle {
    font-size: 14px;
    color: #7A7268;
    max-width: 500px;
    margin: 0 auto 32px;
  }

  /* Navigation Grid */
  .navigation-section {
    padding: 60px 48px;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 32px;
    color: #F2EDE4;
    border-bottom: 1px solid #2A2620;
    padding-bottom: 16px;
  }

  .nav-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    margin-bottom: 60px;
  }

  .nav-card {
    background: #1A1714;
    border: 1px solid #2A2620;
    padding: 32px 24px;
    text-align: center;
    text-decoration: none;
    color: #F2EDE4;
    transition: all 0.3s;
    cursor: pointer;
  }

  .nav-card:hover {
    background: #1E1C19;
    border-color: #C17A3A;
    transform: translateY(-4px);
  }

  .card-icon {
    font-size: 32px;
    margin-bottom: 12px;
    color: #C17A3A;
  }

  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .card-description {
    font-size: 12px;
    color: #7A7268;
    line-height: 1.5;
  }

  /* Sales Dashboard */
  .dashboard-section {
    padding: 60px 48px;
    background: #161411;
    border-top: 1px solid #2A2620;
  }

  .sales-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 24px;
  }

  .sales-table th {
    padding: 12px;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #7A7268;
    border-bottom: 1px solid #2A2620;
    text-align: left;
  }

  .sales-table td {
    padding: 12px;
    border-bottom: 1px solid #1E1C19;
  }

  .sales-table tr:hover {
    background: #1A1714;
  }

  .export-btn {
    display: inline-block;
    padding: 10px 20px;
    background: transparent;
    border: 1px solid #C17A3A;
    color: #C17A3A;
    text-decoration: none;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 16px;
  }

  .export-btn:hover {
    background: #C17A3A;
    color: #111010;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    color: #7A7268;
    font-size: 12px;
    margin: 24px 0;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #2A2620;
    border-top-color: #C17A3A;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 700px) {
    .nav-links { flex-direction: column; gap: 12px; }
    .hero { padding: 40px 24px; }
    .section-title { font-size: 20px; }
    .dashboard-section { padding: 40px 24px; }
  }
`

export default function Home(){

  type Sale = {
    day: string;
    total_orders: number;
    total_sales: number;
    average_ticket: number;
  };

  const [sales,setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  const sampleSales: Sale[] = [
    { day: '2026-03-10', total_orders: 5, total_sales: 450.0, average_ticket: 90.0 },
    { day: '2026-03-11', total_orders: 3, total_sales: 240.0, average_ticket: 80.0 },
  ];

  useEffect(()=>{
    fetch("/api/reports/daily-sales")
      .then(res=>res.json())
      .then((data: any[])=>{
        // Convertir strings a números
        const convertedData: Sale[] = data.map(item => ({
          day: item.day,
          total_orders: Number(item.total_orders),
          total_sales: Number(item.total_sales),
          average_ticket: Number(item.average_ticket)
        }));
        setSales(convertedData.length ? convertedData : sampleSales)
        setLoading(false)
      })
      .catch(()=>{
        setSales(sampleSales)
        setLoading(false)
      })
  },[])

  const navItems = [
    {
      icon: '🍽️',
      title: 'Menú',
      description: 'Ver platillos disponibles',
      href: '/menu'
    },
    {
      icon: '📋',
      title: 'Órdenes',
      description: 'Gestionar pedidos',
      href: '/orders'
    },
    {
      icon: '✅',
      title: 'Confirmar Órdenes',
      description: 'Panel de administración',
      href: '/admin/ordenes'
    },
    {
      icon: '📦',
      title: 'Gestión de Stock',
      description: 'Inventario y disponibilidad',
      href: '/admin/stock'
    },
    {
      icon: '📸',
      title: 'Imágenes Productos',
      description: 'Subir y gestionar imágenes',
      href: '/admin/productos/imagenes'
    },
    {
      icon: '📊',
      title: 'Dashboard Ventas',
      description: 'Reportes y estadísticas',
      href: '/dashboard'
    }
  ]

  return(
    <>
      <style>{styles}</style>
      <div className="home-root">
        {/* Header */}
        <header className="home-header">
          <div className="logo">La Parrilla Mixteca</div>
          <nav className="nav-links">
            <a href="/menu">Menú</a>
            <a href="/admin/ordenes">Admin Órdenes</a>
            <a href="/admin/stock">Stock</a>
            <a href="/dashboard">Reportes</a>
          </nav>
        </header>

        {/* Hero */}
        <section className="hero">
          <p className="hero-label">Sistema de Gestión Integral</p>
          <h1 className="hero-title">Bienvenido a <em>La Parrilla Mixteca</em></h1>
          <p className="hero-subtitle">
            Sistema completo de pedidos, inventario y reportes para la gestión eficiente de tu restaurante.
          </p>
        </section>

        {/* Navigation Grid */}
        <section className="navigation-section">
          <h2 className="section-title">Acceso Rápido</h2>
          <div className="nav-grid">
            {navItems.map((item, i) => (
              <a key={i} href={item.href} className="nav-card">
                <div className="card-icon">{item.icon}</div>
                <div className="card-title">{item.title}</div>
                <div className="card-description">{item.description}</div>
              </a>
            ))}
          </div>
        </section>

        {/* Sales Dashboard */}
        <section className="dashboard-section">
          <h2 className="section-title">📊 Ventas Recientes</h2>
          
          {loading ? (
            <div className="loading">
              <div className="spinner" />
              Cargando datos...
            </div>
          ) : (
            <>
              <a href="/api/reports/daily-sales/csv" className="export-btn">
                📥 Descargar CSV
              </a>
              
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Día</th>
                    <th>Pedidos</th>
                    <th>Total Ventas</th>
                    <th>Promedio por Orden</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s)=> (
                    <tr key={s.day}>
                      <td>{s.day}</td>
                      <td>{s.total_orders}</td>
                      <td>${s.total_sales.toFixed(2)}</td>
                      <td>${s.average_ticket.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>
      </div>
    </>
  )
}
