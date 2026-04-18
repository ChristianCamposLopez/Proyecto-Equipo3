// app/admin/reviews/page.tsx
// US017: Dashboard analítico de calificaciones y comentarios para el administrador

"use client";

import { useEffect, useState } from "react";

interface ReviewStats {
  product_id: number;
  product_name: string;
  avg_rating: number;
  total_reviews: number;
}

interface Review {
  id: number;
  product_name: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const STARS = (rating: number) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
};

export default function AdminReviewsPage() {
  const [stats, setStats] = useState<ReviewStats[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProduct, setFilterProduct] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/reviews/stats").then((r) => r.json()),
      fetch("/api/reviews").then((r) => r.json()),
    ])
      .then(([statsData, reviewsData]) => {
        setStats(Array.isArray(statsData) ? statsData : []);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const avgGeneral =
    stats.length > 0
      ? (
          stats.reduce((s, r) => s + Number(r.avg_rating) * r.total_reviews, 0) /
          stats.reduce((s, r) => s + r.total_reviews, 0)
        ).toFixed(1)
      : "0";

  const totalReviews = stats.reduce((s, r) => s + r.total_reviews, 0);

  const filteredReviews =
    filterProduct === "all"
      ? reviews
      : reviews.filter((r) => r.product_name === filterProduct);

  const uniqueProducts = [...new Set(reviews.map((r) => r.product_name))];

  return (
    <>
      <style>{`
        .reviews-admin { padding: 32px; max-width: 1200px; margin: 0 auto; animation: rvFadeIn 0.4s ease; }
        @keyframes rvFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .reviews-header h1 { font-size: 24px; font-weight: 700; color: #fff; margin: 0 0 4px; }
        .reviews-header p { font-size: 13px; color: #555; margin: 0 0 28px; }

        /* KPI Row */
        .reviews-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 28px; }
        .rv-kpi {
          background: #111; border: 1px solid #1e1e1e; border-radius: 12px;
          padding: 20px; text-align: center; transition: all 0.2s;
        }
        .rv-kpi:hover { border-color: #333; transform: translateY(-2px); }
        .rv-kpi-value { font-size: 32px; font-weight: 700; color: #D35400; }
        .rv-kpi-stars { font-size: 18px; color: #E67E22; margin-top: 4px; }
        .rv-kpi-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; }

        /* Stats Table */
        .rv-section-title {
          font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;
          color: #555; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #1e1e1e;
        }
        .rv-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-bottom: 32px; }
        .rv-stat-card {
          background: #111; border: 1px solid #1e1e1e; border-radius: 10px;
          padding: 16px; display: flex; align-items: center; gap: 14px;
          transition: all 0.15s;
        }
        .rv-stat-card:hover { border-color: #333; }
        .rv-stat-rank {
          width: 36px; height: 36px; border-radius: 8px;
          background: rgba(211,84,0,0.12); color: #D35400;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; flex-shrink: 0;
        }
        .rv-stat-info h4 { font-size: 14px; color: #fff; margin: 0; font-weight: 600; }
        .rv-stat-info .rv-stars { color: #E67E22; font-size: 13px; }
        .rv-stat-info .rv-count { font-size: 11px; color: #555; }

        /* Filter */
        .rv-filter-bar {
          display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;
        }
        .rv-filter-bar label { font-size: 12px; color: #666; }
        .rv-filter-select {
          padding: 8px 12px; background: #111; border: 1px solid #2a2a2a;
          border-radius: 6px; color: #ccc; font-size: 13px; font-family: inherit; outline: none;
        }
        .rv-filter-select:focus { border-color: #D35400; }

        /* Comments List */
        .rv-comments { background: #111; border: 1px solid #1e1e1e; border-radius: 12px; overflow: hidden; }
        .rv-comment {
          padding: 16px 20px; border-bottom: 1px solid #141414;
          transition: background 0.15s;
        }
        .rv-comment:last-child { border-bottom: none; }
        .rv-comment:hover { background: #0d0d0d; }
        .rv-comment-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .rv-comment-product { font-size: 14px; font-weight: 600; color: #fff; }
        .rv-comment-rating { color: #E67E22; font-size: 14px; }
        .rv-comment-text { font-size: 13px; color: #999; line-height: 1.5; margin-bottom: 6px; }
        .rv-comment-meta { font-size: 11px; color: #444; display: flex; gap: 12px; }

        .rv-empty { padding: 60px 20px; text-align: center; color: #444; }
        .rv-loading { padding: 60px 20px; text-align: center; color: #555; }

        @media (max-width: 640px) {
          .reviews-admin { padding: 16px; }
          .rv-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="reviews-admin">
        <div className="reviews-header">
          <h1>⭐ Panel de Reseñas</h1>
          <p>Análisis de calificaciones y comentarios de los clientes</p>
        </div>

        {loading ? (
          <div className="rv-loading">Cargando reseñas...</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="reviews-kpis">
              <div className="rv-kpi">
                <div className="rv-kpi-value">{avgGeneral}</div>
                <div className="rv-kpi-stars">{STARS(Number(avgGeneral))}</div>
                <div className="rv-kpi-label">Calificación General</div>
              </div>
              <div className="rv-kpi">
                <div className="rv-kpi-value">{totalReviews}</div>
                <div className="rv-kpi-label">Total de Reseñas</div>
              </div>
              <div className="rv-kpi">
                <div className="rv-kpi-value">{stats.length}</div>
                <div className="rv-kpi-label">Productos Calificados</div>
              </div>
              <div className="rv-kpi">
                <div className="rv-kpi-value">
                  {stats.length > 0 ? stats[0].product_name.substring(0, 15) : "—"}
                </div>
                <div className="rv-kpi-label">Mejor Calificado</div>
              </div>
            </div>

            {/* Stats by product */}
            <div className="rv-section-title">Calificación por Producto</div>
            <div className="rv-stats-grid">
              {stats.map((s, i) => (
                <div key={s.product_id} className="rv-stat-card">
                  <div className="rv-stat-rank">{i + 1}</div>
                  <div className="rv-stat-info">
                    <h4>{s.product_name}</h4>
                    <div className="rv-stars">
                      {STARS(Number(s.avg_rating))} {Number(s.avg_rating).toFixed(1)}
                    </div>
                    <div className="rv-count">{s.total_reviews} reseñas</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comments */}
            <div className="rv-section-title">Todos los Comentarios</div>
            <div className="rv-filter-bar">
              <label>Filtrar por:</label>
              <select
                className="rv-filter-select"
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
              >
                <option value="all">Todos los productos</option>
                {uniqueProducts.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: 12, color: "#555" }}>
                {filteredReviews.length} comentarios
              </span>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="rv-empty">No hay comentarios</div>
            ) : (
              <div className="rv-comments">
                {filteredReviews.map((r) => (
                  <div key={r.id} className="rv-comment">
                    <div className="rv-comment-top">
                      <span className="rv-comment-product">{r.product_name}</span>
                      <span className="rv-comment-rating">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                    <div className="rv-comment-text">
                      {r.comment || <em style={{ color: "#333" }}>Sin comentario</em>}
                    </div>
                    <div className="rv-comment-meta">
                      <span>👤 {r.customer_name}</span>
                      <span>
                        📅 {new Date(r.created_at).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
