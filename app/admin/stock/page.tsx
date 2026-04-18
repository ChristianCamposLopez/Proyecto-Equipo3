// app/admin/stock/page.tsx
// US008: Control de Stock — Marcar plato como agotado

"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  base_price: number;
  is_available: boolean;
  category_name: string;
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/stock");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleAvailability = async (productId: number, currentAvailable: boolean) => {
    setUpdatingId(productId);
    try {
      await fetch(`/api/stock/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: !currentAvailable }),
      });
      await fetchProducts();
    } catch {
      alert("Error al cambiar disponibilidad");
    } finally {
      setUpdatingId(null);
    }
  };

  const available = products.filter((p) => p.is_available).length;
  const outOfStock = products.filter((p) => !p.is_available).length;

  return (
    <>
      <style>{`
        .stock-page { padding: 32px; max-width: 1200px; margin: 0 auto; animation: stFadeIn 0.4s ease; }
        @keyframes stFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .stock-header h1 { font-size: 24px; font-weight: 700; color: #fff; margin: 0 0 4px; }
        .stock-header p { font-size: 13px; color: #555; margin: 0 0 24px; }

        .stock-summary {
          display: flex; gap: 14px; margin-bottom: 24px; flex-wrap: wrap;
        }
        .stock-badge {
          padding: 10px 20px; border-radius: 10px; font-size: 13px;
          font-weight: 600; display: flex; align-items: center; gap: 8px;
          background: #111; border: 1px solid #1e1e1e;
        }
        .stock-dot { width: 10px; height: 10px; border-radius: 50%; }

        .stock-list {
          background: #111; border: 1px solid #1e1e1e; border-radius: 12px; overflow: hidden;
        }

        .stock-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 24px; border-bottom: 1px solid #141414;
          transition: background 0.15s; gap: 16px;
        }
        .stock-item:last-child { border-bottom: none; }
        .stock-item:hover { background: #0d0d0d; }
        .stock-item.unavailable { opacity: 0.5; }

        .stock-item-info { flex: 1; }
        .stock-item-name { font-size: 15px; font-weight: 600; color: #fff; }
        .stock-item-meta {
          font-size: 12px; color: #555; margin-top: 2px;
          display: flex; gap: 12px;
        }
        .stock-item-price { color: #D35400; }

        .stock-status-badge {
          padding: 5px 14px; border-radius: 6px; font-size: 12px;
          font-weight: 600; min-width: 90px; text-align: center;
          letter-spacing: 0.03em;
        }
        .stock-status-badge.available { background: rgba(46,204,113,0.12); color: #2ECC71; }
        .stock-status-badge.out { background: rgba(231,76,60,0.12); color: #E74C3C; }

        /* Toggle Switch */
        .toggle-switch {
          position: relative; width: 48px; height: 26px;
          background: #2a2a2a; border-radius: 13px;
          cursor: pointer; transition: all 0.3s; flex-shrink: 0;
          border: none; padding: 0;
        }
        .toggle-switch.active { background: #27AE60; }
        .toggle-switch.updating { opacity: 0.5; cursor: wait; }

        .toggle-knob {
          position: absolute; top: 3px; left: 3px;
          width: 20px; height: 20px; border-radius: 50%;
          background: #fff; transition: transform 0.3s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .toggle-switch.active .toggle-knob { transform: translateX(22px); }

        .stock-loading { padding: 60px 20px; text-align: center; color: #555; }
        .stock-empty { padding: 60px 20px; text-align: center; color: #444; }

        @media (max-width: 640px) {
          .stock-page { padding: 16px; }
          .stock-item { flex-wrap: wrap; }
        }
      `}</style>

      <div className="stock-page">
        <div className="stock-header">
          <h1>📦 Control de Stock</h1>
          <p>Marca platillos como agotados para bloquear su pedido en la app</p>
        </div>

        <div className="stock-summary">
          <div className="stock-badge">
            <div className="stock-dot" style={{ background: "#2ECC71" }} />
            <span style={{ color: "#2ECC71" }}>{available}</span>
            <span style={{ color: "#888" }}>Disponibles</span>
          </div>
          <div className="stock-badge">
            <div className="stock-dot" style={{ background: "#E74C3C" }} />
            <span style={{ color: "#E74C3C" }}>{outOfStock}</span>
            <span style={{ color: "#888" }}>Agotados</span>
          </div>
          <div className="stock-badge">
            <span style={{ color: "#888" }}>Total: {products.length} productos</span>
          </div>
        </div>

        {loading ? (
          <div className="stock-loading">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="stock-empty">No hay productos registrados</div>
        ) : (
          <div className="stock-list">
            {products.map((product) => (
              <div
                key={product.id}
                className={`stock-item ${!product.is_available ? "unavailable" : ""}`}
              >
                <div className="stock-item-info">
                  <div className="stock-item-name">{product.name}</div>
                  <div className="stock-item-meta">
                    <span>{product.category_name}</span>
                    <span className="stock-item-price">
                      ${Number(product.base_price).toFixed(2)}
                    </span>
                  </div>
                </div>

                <span
                  className={`stock-status-badge ${product.is_available ? "available" : "out"}`}
                >
                  {product.is_available ? "🟢 Disponible" : "🔴 Agotado"}
                </span>

                <button
                  className={`toggle-switch ${product.is_available ? "active" : ""} ${updatingId === product.id ? "updating" : ""}`}
                  onClick={() => toggleAvailability(product.id, product.is_available)}
                  disabled={updatingId === product.id}
                  title={product.is_available ? "Marcar como agotado" : "Marcar como disponible"}
                >
                  <div className="toggle-knob" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
