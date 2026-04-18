// [CÓDIGO AUXILIAR]: Este código no pertenece a las HUs principales pero es necesario para la visualización y funcionalidad total.
// app/admin/layout.tsx — Layout compartido para toda el área de administración

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/admin/dashboard", icon: "⚡" },
  { name: "Ranking", path: "/admin/ranking", icon: "🏆" },
  { name: "Horarios", path: "/admin/horarios", icon: "🕐" },
  { name: "Reseñas", path: "/admin/reviews", icon: "⭐" },
  { name: "Cocina", path: "/admin/cocina", icon: "🔥" },
  { name: "Stock", path: "/admin/stock", icon: "📦" },
  { name: "Menú", path: "/menu", icon: "🍽️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.email?.split("@")[0] || "Admin");
    } catch {
      /* token parse error, ignore */
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #0a0a0a;
          color: #e5e5e5;
          font-family: 'Inter', sans-serif;
        }

        /* ── Sidebar ── */
        .admin-sidebar {
          width: 260px;
          background: #111111;
          border-right: 1px solid #1e1e1e;
          display: flex;
          flex-direction: column;
          transition: width 0.3s ease;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 50;
        }

        .admin-sidebar.collapsed {
          width: 72px;
        }

        .admin-sidebar.collapsed .nav-text,
        .admin-sidebar.collapsed .sidebar-brand-text,
        .admin-sidebar.collapsed .sidebar-user-info {
          display: none;
        }

        .sidebar-brand {
          padding: 20px 16px;
          border-bottom: 1px solid #1e1e1e;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sidebar-brand-logo {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #D35400, #E67E22);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .sidebar-brand-text h2 {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .sidebar-brand-text p {
          font-size: 11px;
          color: #666;
          margin: 2px 0 0;
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          color: #888;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
          cursor: pointer;
          margin-bottom: 2px;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .nav-item:hover {
          background: #1a1a1a;
          color: #D35400;
        }

        .nav-item.active {
          background: rgba(211, 84, 0, 0.12);
          color: #D35400;
        }

        .nav-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid #1e1e1e;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .sidebar-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #333, #555);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .sidebar-user-info {
          font-size: 12px;
        }

        .sidebar-user-info strong {
          color: #ccc;
          display: block;
        }

        .sidebar-user-info span {
          color: #555;
          font-size: 11px;
        }

        .btn-logout {
          width: 100%;
          padding: 8px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          color: #888;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }

        .btn-logout:hover {
          background: #2a1a1a;
          border-color: #D35400;
          color: #D35400;
        }

        .btn-toggle {
          position: absolute;
          top: 24px;
          right: -14px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          color: #888;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          z-index: 60;
          transition: all 0.15s;
        }

        .btn-toggle:hover {
          border-color: #D35400;
          color: #D35400;
        }

        /* ── Main ── */
        .admin-main {
          flex: 1;
          margin-left: 260px;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
        }

        .admin-main.expanded {
          margin-left: 72px;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            width: 72px;
          }
          .admin-sidebar .nav-text,
          .admin-sidebar .sidebar-brand-text,
          .admin-sidebar .sidebar-user-info {
            display: none;
          }
          .admin-main {
            margin-left: 72px;
          }
          .btn-toggle {
            display: none;
          }
        }
      `}</style>

      <div className="admin-layout">
        <aside className={`admin-sidebar ${!sidebarOpen ? "collapsed" : ""}`}>
          <button
            className="btn-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>

          <div className="sidebar-brand">
            <div className="sidebar-brand-logo">🔥</div>
            <div className="sidebar-brand-text">
              <h2>La Parrilla</h2>
              <p>Panel Admin</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`nav-item ${pathname === item.path ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </a>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-avatar">👤</div>
              <div className="sidebar-user-info">
                <strong>{userName}</strong>
                <span>Administrador</span>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              {sidebarOpen ? "Cerrar Sesión" : "🚪"}
            </button>
          </div>
        </aside>

        <main className={`admin-main ${!sidebarOpen ? "expanded" : ""}`}>
          {children}
        </main>
      </div>
    </>
  );
}
