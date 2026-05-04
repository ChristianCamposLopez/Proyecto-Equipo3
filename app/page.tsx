"use client"

import { useState, useEffect } from "react"
import { Card } from "@/app/_components/ui/Card"
import { Button } from "@/app/_components/ui/Button"
import Link from "next/link"

export default function RootMenu() {
  const [role, setRole] = useState<string>("client")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setRole(sessionStorage.getItem("userRole") || "client")
    setMounted(true)
  }, [])

  if (!mounted) return null

  const modules = [
    { 
      title: "Módulos de Cliente", 
      icon: "👤",
      role: "client",
      items: [
        { name: "Ver Menú", path: "/menu", icon: "🍱", desc: "Explora y agrega platillos a tu carrito." },
        { name: "Mis Pedidos", path: "/orders", icon: "🛒", desc: "Sigue el estado de tus órdenes en tiempo real." },
        { name: "Perfil", path: "/login", icon: "⚙️", desc: "Gestiona tu cuenta y direcciones." },
      ]
    },
    { 
      title: "Operación", 
      icon: "🍳",
      role: "chef",
      items: [
        { name: "Gestión de Cocina", path: "/kitchen", icon: "👨‍🍳", desc: "Controla pedidos entrantes y estados de preparación." },
        { name: "Disponibilidad", path: "/menu", icon: "📋", desc: "Activa o desactiva productos del catálogo." },
      ]
    },
    { 
      title: "Administración", 
      icon: "🏛️",
      role: "admin",
      items: [
        { name: "Dashboard de Ventas", path: "/admin/ventas", icon: "📈", desc: "Reportes, KPIs y exportación de datos financieros." },
        { name: "Dashboard de ranking", path: "/admin/ranking", icon: "📈", desc: "Reportes de renking top 5." },
        { name: "Reembolsos", path: "/admin/reembolsos", icon: "💰", desc: "Gestión de solicitudes y aprobaciones de reembolsos." },
        { name: "Control de Inventario", path: "/admin/stock", icon: "📦", desc: "Gestión global de existencias y alertas de stock." },
        { name: "Catálogo de Platos", path: "/admin/platos", icon: "🍽️", desc: "Gestión de productos y categorías." },
        { name: "Configuración", path: "/admin/restaurante", icon: "🛡️", desc: "Ajustes globales del establecimiento." },
      ]
    },
    { 
      title: "Logística", 
      icon: "🛵",
      role: "repartidor",
      items: [
        { name: "Pedidos Asignados", path: "/orders", icon: "📦", desc: "Gestión de entregas y cambio de estados." },
      ]
    }
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="root-container">
        <header className="hero-header">
          <div className="label-top">Centro de Mando</div>
          <h1 className="hero-title">
            Isla de <em>Navegación</em>
          </h1>
          <p className="hero-subtitle">
            Estás navegando como: <span className="role-badge">{role}</span>. 
            Gestione el flujo operativo y logístico desde este portal unificado.
          </p>
        </header>

        <main className="content-main">
          {modules.map((section) => (
            <div 
              key={section.title} 
              className={`section-group ${(role !== 'admin' && role !== 'restaurant_admin') && section.role !== role ? 'disabled' : ''}`}
            >
              <h2 className="section-header">
                {section.title} <span>╱ {section.role}</span>
              </h2>
              
              <div className="grid-nav">
                {section.items.map((item) => (
                  <Link key={item.path} href={item.path} className="nav-card">
                    <div className="card-inner">
                      <div className="card-icon">{item.icon}</div>
                      <div className="card-info">
                        <h3 className="card-title">{item.name}</h3>
                        <p className="card-desc">{item.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </main>

        <footer className="root-footer">
          <span>Sistema de Gestión EQ3</span>
          <span>Arquitectura Multicapa & Estilo Elegante</span>
        </footer>
      </div>
    </>
  )
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;700&display=swap');

  .root-container {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .hero-header {
    padding: 72px 48px 48px;
    border-bottom: 1px solid #2A2620;
    position: relative;
    overflow: hidden;
  }

  .hero-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, #3D1F0A22, transparent);
    pointer-events: none;
  }

  .label-top {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .hero-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .hero-subtitle {
    margin-top: 16px;
    font-size: 14px;
    color: #7A7268;
    font-weight: 300;
    max-width: 480px;
    line-height: 1.6;
  }

  .role-badge {
    color: #C17A3A;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .content-main {
    padding: 32px 48px;
  }

  .section-group {
    margin-bottom: 64px;
  }

  .section-group.disabled {
    opacity: 0.25;
    filter: grayscale(1);
    pointer-events: none;
  }

  .section-header {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 24px;
    letter-spacing: -0.02em;
    border-bottom: 1px solid #2A2620;
    padding-bottom: 12px;
  }

  .section-header span {
    color: #C17A3A;
    font-style: italic;
    font-weight: 400;
    font-size: 16px;
    margin-left: 8px;
  }

  .grid-nav {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }

  .nav-card {
    text-decoration: none;
    color: inherit;
    border: 1px solid #2A2620;
    border-radius: 4px;
    transition: all 0.3s ease;
    background: #161412;
  }

  .nav-card:hover {
    border-color: #C17A3A;
    transform: translateY(-2px);
    background: #1C1A17;
  }

  .card-inner {
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .card-icon {
    font-size: 32px;
    background: #111010;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    border: 1px solid #2A2620;
  }

  .nav-card:hover .card-icon {
    border-color: #C17A3A;
    color: #C17A3A;
  }

  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .card-desc {
    font-size: 13px;
    color: #7A7268;
    line-height: 1.4;
  }

  .root-footer {
    padding: 32px 48px;
    border-top: 1px solid #1E1C19;
    font-size: 11px;
    color: #3A3630;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
  }

  @media (max-width: 768px) {
    .hero-header { padding: 48px 24px; }
    .content-main { padding: 24px; }
    .grid-nav { grid-template-columns: 1fr; }
    .root-footer { padding: 24px; flex-direction: column; gap: 8px; }
  }
`;
