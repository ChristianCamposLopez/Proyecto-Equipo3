// app/admin/dashboard/page.tsx
// [CÓDIGO AUXILIAR]: Hub Central de Administración post-login

"use client";

import { useEffect, useState } from "react";

const MODULES = [
  {
    name: "Ranking de Ventas",
    description: "Top 5 platillos, filtros por fecha y exportación",
    path: "/admin/ranking",
    icon: "🏆",
    hus: "US019.1-4",
    gradient: "linear-gradient(135deg, #D35400, #E67E22)",
  },
  {
    name: "Horarios de Disponibilidad",
    description: "Configura cuándo se muestran los platillos",
    path: "/admin/horarios",
    icon: "🕐",
    hus: "US020",
    gradient: "linear-gradient(135deg, #2980B9, #3498DB)",
  },
  {
    name: "Reseñas y Calificaciones",
    description: "Panel analítico de feedback de clientes",
    path: "/admin/reviews",
    icon: "⭐",
    hus: "US017",
    gradient: "linear-gradient(135deg, #8E44AD, #9B59B6)",
  },
  {
    name: "Panel de Cocina",
    description: "Gestión de pedidos en tiempo real",
    path: "/admin/cocina",
    icon: "🔥",
    hus: "US004",
    gradient: "linear-gradient(135deg, #C0392B, #E74C3C)",
  },
  {
    name: "Control de Stock",
    description: "Marca platillos como agotados",
    path: "/admin/stock",
    icon: "📦",
    hus: "US008",
    gradient: "linear-gradient(135deg, #27AE60, #2ECC71)",
  },
  {
    name: "Menú Público",
    description: "Vista del menú como lo ven los clientes",
    path: "/menu",
    icon: "🍽️",
    hus: "US009",
    gradient: "linear-gradient(135deg, #555, #777)",
  },
];

interface QuickStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<QuickStat[]>([
    { label: "Ventas Hoy", value: "—", icon: "💰", color: "#D35400" },
    { label: "Pedidos Activos", value: "—", icon: "📋", color: "#E67E22" },
    { label: "Platillos", value: "—", icon: "🍔", color: "#2ECC71" },
    { label: "Reseñas", value: "—", icon: "⭐", color: "#9B59B6" },
  ]);
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch KPIs en paralelo
    Promise.allSettled([
      fetch("/api/reports/daily-sales").then((r) => r.json()),
      fetch("/api/kitchen/orders").then((r) => r.json()),
      fetch("/api/stock").then((r) => r.json()),
      fetch("/api/reviews/stats").then((r) => r.json()),
    ]).then(([salesRes, ordersRes, stockRes, reviewsRes]) => {
      const newStats = [...stats];

      if (salesRes.status === "fulfilled" && Array.isArray(salesRes.value)) {
        const todaySales = salesRes.value[0];
        newStats[0].value = todaySales
          ? `$${Number(todaySales.total_sales).toFixed(0)}`
          : "$0";
      }

      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value)) {
        newStats[1].value = `${ordersRes.value.length}`;
      }

      if (stockRes.status === "fulfilled" && Array.isArray(stockRes.value)) {
        const available = stockRes.value.filter(
          (p: { is_available: boolean }) => p.is_available
        ).length;
        newStats[2].value = `${available}/${stockRes.value.length}`;
      }

      if (
        reviewsRes.status === "fulfilled" &&
        Array.isArray(reviewsRes.value)
      ) {
        const totalReviews = reviewsRes.value.reduce(
          (sum: number, s: { total_reviews: number }) => sum + s.total_reviews,
          0
        );
        newStats[3].value = `${totalReviews}`;
      }

      setStats(newStats);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        .dash-container {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
          animation: dashFadeIn 0.5s ease;
        }

        @keyframes dashFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dash-header {
          margin-bottom: 32px;
        }

        .dash-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.03em;
          margin: 0;
        }

        .dash-header h1 span {
          color: #D35400;
        }

        .dash-header-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 8px;
          font-size: 13px;
          color: #666;
        }

        .dash-clock {
          font-family: 'Courier New', monospace;
          color: #D35400;
          font-weight: 600;
        }

        /* ── KPIs ── */
        .dash-kpis {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }

        .kpi-card {
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
        }

        .kpi-card:hover {
          border-color: #333;
          transform: translateY(-2px);
        }

        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .kpi-data h3 {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .kpi-data p {
          font-size: 12px;
          color: #666;
          margin: 2px 0 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ── Modules Grid ── */
        .dash-section-title {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #555;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #1e1e1e;
        }

        .dash-modules {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .module-card {
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 14px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.25s ease;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }

        .module-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          opacity: 0;
          transition: opacity 0.25s;
        }

        .module-card:hover {
          border-color: #333;
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        .module-card:hover::before {
          opacity: 1;
        }

        .module-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .module-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .module-badge {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 4px;
          background: #1a1a1a;
          color: #666;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .module-name {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }

        .module-desc {
          font-size: 13px;
          color: #555;
          margin: 0;
          line-height: 1.4;
        }

        .module-action {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #1a1a1a;
          font-size: 12px;
          color: #D35400;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 640px) {
          .dash-container { padding: 16px; }
          .dash-modules { grid-template-columns: 1fr; }
          .dash-kpis { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="dash-container">
        <header className="dash-header">
          <h1>
            Panel de <span>Administración</span>
          </h1>
          <div className="dash-header-meta">
            <span>La Parrilla Mixteca</span>
            <span>•</span>
            <span className="dash-clock">{time}</span>
          </div>
        </header>

        {/* KPIs rápidos */}
        <div className="dash-kpis">
          {stats.map((stat, i) => (
            <div key={i} className="kpi-card">
              <div
                className="kpi-icon"
                style={{ background: `${stat.color}18` }}
              >
                {stat.icon}
              </div>
              <div className="kpi-data">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Módulos */}
        <div className="dash-section-title">Módulos del Sistema</div>
        <div className="dash-modules">
          {MODULES.map((mod) => (
            <a key={mod.path} href={mod.path} className="module-card">
              <div
                style={
                  { "--gradient": mod.gradient } as React.CSSProperties & {
                    "--gradient": string;
                  }
                }
              >
                <style>{`
                  .module-card:has([style*="${mod.gradient}"])::before {
                    background: ${mod.gradient};
                  }
                `}</style>
              </div>
              <div className="module-top">
                <div
                  className="module-icon"
                  style={{ background: mod.gradient }}
                >
                  {mod.icon}
                </div>
                <span className="module-badge">{mod.hus}</span>
              </div>
              <h3 className="module-name">{mod.name}</h3>
              <p className="module-desc">{mod.description}</p>
              <div className="module-action">
                Abrir módulo <span>→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
