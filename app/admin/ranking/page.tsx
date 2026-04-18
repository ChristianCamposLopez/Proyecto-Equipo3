// app/admin/ranking/page.tsx
// US019.1-4: Ranking de Ventas - Top 5, Filtros por fecha, Exportación

"use client";

import { useEffect, useState } from "react";

interface RankedProduct {
  product_id: number;
  product_name: string;
  category_name: string;
  total_sold: number;
  total_revenue: number;
}

const MEDALS = ["🥇", "🥈", "🥉", "4°", "5°"];

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchRanking = async (start?: string, end?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (start) params.set("start", start);
      if (end) params.set("end", end);
      params.set("limit", "5");

      const res = await fetch(`/api/ranking?${params}`);
      const data = await res.json();
      setRanking(Array.isArray(data) ? data : []);
    } catch {
      setRanking([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  const handleFilter = () => {
    fetchRanking(startDate, endDate);
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    fetchRanking();
  };

  const handleExport = (format: "csv" | "pdf") => {
    const params = new URLSearchParams();
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
    params.set("format", format);
    window.open(`/api/ranking/export?${params}`, "_blank");
  };

  const maxSold = ranking.length > 0 ? Math.max(...ranking.map((r) => r.total_sold)) : 1;

  return (
    <>
      <style>{`
        .ranking-page {
          padding: 32px;
          max-width: 1200px;
          margin: 0 auto;
          animation: rankFadeIn 0.4s ease;
        }
        @keyframes rankFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ranking-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 4px;
        }
        .ranking-header p {
          font-size: 13px;
          color: #555;
          margin: 0 0 24px;
        }

        /* Filters */
        .ranking-filters {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          flex-wrap: wrap;
          margin-bottom: 28px;
          padding: 20px;
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 12px;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .filter-group label {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .filter-input {
          padding: 8px 12px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          color: #ccc;
          font-size: 13px;
          font-family: inherit;
          outline: none;
        }
        .filter-input:focus { border-color: #D35400; }
        .filter-input::-webkit-calendar-picker-indicator { filter: invert(0.6); }

        .btn-filter {
          padding: 8px 20px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          font-family: inherit;
          transition: all 0.15s;
        }
        .btn-apply {
          background: #D35400;
          color: #fff;
        }
        .btn-apply:hover { background: #E67E22; }
        .btn-clear {
          background: #1a1a1a;
          color: #888;
          border: 1px solid #2a2a2a;
        }
        .btn-clear:hover { border-color: #555; color: #ccc; }

        /* Export buttons */
        .ranking-exports {
          display: flex;
          gap: 8px;
          margin-left: auto;
        }
        .btn-export {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #2a2a2a;
          background: #111;
          color: #888;
          font-family: inherit;
          transition: all 0.15s;
        }
        .btn-export:hover { border-color: #D35400; color: #D35400; }

        /* Table */
        .ranking-table-wrap {
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 12px;
          overflow: hidden;
        }
        .ranking-table {
          width: 100%;
          border-collapse: collapse;
        }
        .ranking-table th {
          padding: 14px 20px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #555;
          border-bottom: 1px solid #1e1e1e;
          font-weight: 600;
        }
        .ranking-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #141414;
          font-size: 14px;
        }
        .ranking-table tr:last-child td { border-bottom: none; }
        .ranking-table tr:hover td { background: #0d0d0d; }

        .rank-pos {
          font-size: 20px;
          text-align: center;
          width: 48px;
        }
        .rank-name {
          font-weight: 600;
          color: #fff;
        }
        .rank-category {
          font-size: 11px;
          color: #555;
          margin-top: 2px;
        }
        .rank-revenue {
          color: #D35400;
          font-weight: 600;
        }

        /* Bar chart */
        .rank-bar-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rank-bar {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(90deg, #D35400, #E67E22);
          transition: width 0.6s ease;
          min-width: 4px;
        }
        .rank-bar-value {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          min-width: 30px;
        }

        .ranking-empty {
          padding: 60px 20px;
          text-align: center;
          color: #444;
          font-size: 15px;
        }
        .ranking-loading {
          padding: 60px 20px;
          text-align: center;
          color: #555;
        }
        .loader-spin {
          width: 28px;
          height: 28px;
          border: 2px solid #222;
          border-top-color: #D35400;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .ranking-page { padding: 16px; }
          .ranking-filters { flex-direction: column; }
          .ranking-exports { margin-left: 0; width: 100%; }
          .btn-export { flex: 1; }
        }
      `}</style>

      <div className="ranking-page">
        <div className="ranking-header">
          <h1>🏆 Ranking de Ventas</h1>
          <p>Los 5 platillos con mayor volumen de ventas del período seleccionado</p>
        </div>

        {/* US019.3: Filtros de fecha */}
        <div className="ranking-filters">
          <div className="filter-group">
            <label>Fecha Inicio</label>
            <input
              type="date"
              className="filter-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Fecha Fin</label>
            <input
              type="date"
              className="filter-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button className="btn-filter btn-apply" onClick={handleFilter}>
            Aplicar Filtro
          </button>
          <button className="btn-filter btn-clear" onClick={handleClearFilter}>
            Limpiar
          </button>

          {/* US019.4: Exportación */}
          <div className="ranking-exports">
            <button className="btn-export" onClick={() => handleExport("csv")}>
              📊 Excel (CSV)
            </button>
            <button className="btn-export" onClick={() => handleExport("pdf")}>
              📄 PDF
            </button>
          </div>
        </div>

        {/* US019.2: Top 5 */}
        <div className="ranking-table-wrap">
          {loading ? (
            <div className="ranking-loading">
              <div className="loader-spin" />
              Calculando ranking...
            </div>
          ) : ranking.length === 0 ? (
            <div className="ranking-empty">
              No hay datos de ventas para el período seleccionado
            </div>
          ) : (
            <table className="ranking-table">
              <thead>
                <tr>
                  <th style={{ width: 60, textAlign: "center" }}>#</th>
                  <th>Producto</th>
                  <th style={{ width: "35%" }}>Unidades Vendidas</th>
                  <th style={{ textAlign: "right" }}>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((product, i) => (
                  <tr key={product.product_id}>
                    <td className="rank-pos">{MEDALS[i] || `${i + 1}°`}</td>
                    <td>
                      <div className="rank-name">{product.product_name}</div>
                      <div className="rank-category">{product.category_name}</div>
                    </td>
                    <td>
                      <div className="rank-bar-wrap">
                        <div
                          className="rank-bar"
                          style={{
                            width: `${(product.total_sold / maxSold) * 100}%`,
                          }}
                        />
                        <span className="rank-bar-value">{product.total_sold}</span>
                      </div>
                    </td>
                    <td className="rank-revenue" style={{ textAlign: "right" }}>
                      ${Number(product.total_revenue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
