// app/admin/horarios/page.tsx
// US020-020.4: Control de Disponibilidad Horaria

"use client";

import { useEffect, useState } from "react";

interface Schedule {
  id: number;
  product_id: number;
  product_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Product {
  id: number;
  name: string;
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function HorariosPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);

  // Form state
  const [formProductId, setFormProductId] = useState<number>(0);
  const [formDay, setFormDay] = useState<number>(1);
  const [formStart, setFormStart] = useState("08:00");
  const [formEnd, setFormEnd] = useState("22:00");
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, prodRes] = await Promise.all([
        fetch("/api/schedules").then((r) => r.json()),
        fetch("/api/stock").then((r) => r.json()),
      ]);
      setSchedules(Array.isArray(schedRes) ? schedRes : []);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormProductId(products[0]?.id || 0);
    setFormDay(1);
    setFormStart("08:00");
    setFormEnd("22:00");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (s: Schedule) => {
    setEditing(s);
    setFormProductId(s.product_id);
    setFormDay(s.day_of_week);
    setFormStart(s.start_time.substring(0, 5));
    setFormEnd(s.end_time.substring(0, 5));
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    try {
      if (editing) {
        const res = await fetch(`/api/schedules/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            day_of_week: formDay,
            start_time: formStart,
            end_time: formEnd,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
      } else {
        const res = await fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: formProductId,
            day_of_week: formDay,
            start_time: formStart,
            end_time: formEnd,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este horario?")) return;
    try {
      await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      fetchData();
    } catch {
      /* ignore */
    }
  };

  // Group schedules by product for the grid view
  const grouped = schedules.reduce(
    (acc, s) => {
      const key = s.product_name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
      return acc;
    },
    {} as Record<string, Schedule[]>
  );

  // Check if a time range is active now
  const isActiveNow = (s: Schedule) => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    return s.day_of_week === currentDay && s.start_time <= currentTime + ":00" && s.end_time >= currentTime + ":00";
  };

  return (
    <>
      <style>{`
        .horarios-page { padding: 32px; max-width: 1200px; margin: 0 auto; animation: hfadeIn 0.4s ease; }
        @keyframes hfadeIn { from { opacity: 0; } to { opacity: 1; } }

        .horarios-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
        .horarios-header h1 { font-size: 24px; font-weight: 700; color: #fff; margin: 0; }
        .horarios-header p { font-size: 13px; color: #555; margin: 4px 0 0; }

        .btn-new {
          padding: 10px 20px; background: #D35400; color: #fff; border: none;
          border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
        }
        .btn-new:hover { background: #E67E22; transform: translateY(-1px); }

        /* Product Groups */
        .product-group { background: #111; border: 1px solid #1e1e1e; border-radius: 12px; margin-bottom: 16px; overflow: hidden; }
        .product-group-header {
          padding: 16px 20px; border-bottom: 1px solid #1a1a1a;
          display: flex; align-items: center; gap: 10px;
          font-size: 16px; font-weight: 600; color: #fff;
        }
        .product-group-header span { font-size: 12px; color: #555; font-weight: 400; }

        .schedule-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1px; background: #1a1a1a; }
        .schedule-item {
          padding: 14px 16px; background: #111; display: flex; flex-direction: column; gap: 6px;
          transition: background 0.15s; cursor: pointer; position: relative;
        }
        .schedule-item:hover { background: #161616; }
        .schedule-item.active-now { border-left: 3px solid #2ECC71; }

        .sched-day { font-size: 12px; font-weight: 600; color: #D35400; text-transform: uppercase; letter-spacing: 0.05em; }
        .sched-time { font-size: 15px; color: #ccc; font-weight: 500; }
        .sched-badge {
          position: absolute; top: 8px; right: 8px;
          font-size: 9px; padding: 2px 6px; border-radius: 3px;
          background: #1a3a1a; color: #2ECC71; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .sched-actions { display: flex; gap: 6px; margin-top: 6px; }
        .sched-btn {
          padding: 4px 10px; background: #1a1a1a; border: 1px solid #252525;
          border-radius: 4px; color: #888; font-size: 11px; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
        }
        .sched-btn:hover { border-color: #555; color: #ccc; }
        .sched-btn.delete:hover { border-color: #C0392B; color: #E74C3C; }

        /* Empty state */
        .horarios-empty { padding: 60px 20px; text-align: center; color: #444; background: #111; border: 1px solid #1e1e1e; border-radius: 12px; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center; z-index: 100;
          animation: modalFade 0.2s ease;
        }
        @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
        .modal-card {
          background: #131313; border: 1px solid #2a2a2a; border-radius: 14px;
          padding: 28px; width: 100%; max-width: 420px; margin: 16px;
        }
        .modal-card h2 { font-size: 18px; color: #fff; margin: 0 0 20px; }

        .modal-field { margin-bottom: 16px; }
        .modal-field label { display: block; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .modal-field select,
        .modal-field input {
          width: 100%; padding: 10px 12px; background: #0a0a0a;
          border: 1px solid #2a2a2a; border-radius: 6px; color: #ccc;
          font-size: 14px; font-family: inherit; outline: none;
        }
        .modal-field select:focus,
        .modal-field input:focus { border-color: #D35400; }

        .modal-error { background: #2a1515; color: #E74C3C; padding: 8px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 16px; }
        .modal-actions { display: flex; gap: 10px; }
        .modal-actions button {
          flex: 1; padding: 10px; border-radius: 6px; font-size: 13px;
          font-weight: 600; cursor: pointer; border: none; font-family: inherit;
          transition: all 0.15s;
        }
        .modal-save { background: #D35400; color: #fff; }
        .modal-save:hover { background: #E67E22; }
        .modal-cancel { background: #1a1a1a; color: #888; border: 1px solid #2a2a2a !important; }
        .modal-cancel:hover { color: #ccc; }

        .horarios-loading { padding: 60px 20px; text-align: center; color: #555; }

        @media (max-width: 640px) {
          .horarios-page { padding: 16px; }
          .schedule-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="horarios-page">
        <div className="horarios-header">
          <div>
            <h1>🕐 Horarios de Disponibilidad</h1>
            <p>Configura cuándo cada platillo es visible en el menú</p>
          </div>
          <button className="btn-new" onClick={openCreate}>
            + Nuevo Horario
          </button>
        </div>

        {loading ? (
          <div className="horarios-loading">Cargando horarios...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="horarios-empty">
            <p style={{ fontSize: 40, marginBottom: 12 }}>🕐</p>
            <p>No hay horarios configurados</p>
            <p style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
              Los platillos sin horario asignado se muestran siempre
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([productName, items]) => (
            <div key={productName} className="product-group">
              <div className="product-group-header">
                🍽️ {productName}
                <span>{items.length} horario(s)</span>
              </div>
              <div className="schedule-grid">
                {items.map((s) => (
                  <div
                    key={s.id}
                    className={`schedule-item ${isActiveNow(s) ? "active-now" : ""}`}
                  >
                    {isActiveNow(s) && <div className="sched-badge">Activo</div>}
                    <div className="sched-day">{DAYS[s.day_of_week]}</div>
                    <div className="sched-time">
                      {s.start_time.substring(0, 5)} — {s.end_time.substring(0, 5)}
                    </div>
                    <div className="sched-actions">
                      <button className="sched-btn" onClick={() => openEdit(s)}>
                        Editar
                      </button>
                      <button
                        className="sched-btn delete"
                        onClick={() => handleDelete(s.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Editar Horario" : "Nuevo Horario"}</h2>

            {!editing && (
              <div className="modal-field">
                <label>Producto</label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(Number(e.target.value))}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-field">
              <label>Día de la semana</label>
              <select
                value={formDay}
                onChange={(e) => setFormDay(Number(e.target.value))}
              >
                {DAY_SHORT.map((d, i) => (
                  <option key={i} value={i}>
                    {DAYS[i]}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div className="modal-field" style={{ flex: 1 }}>
                <label>Desde</label>
                <input
                  type="time"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                />
              </div>
              <div className="modal-field" style={{ flex: 1 }}>
                <label>Hasta</label>
                <input
                  type="time"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                />
              </div>
            </div>

            {formError && <div className="modal-error">{formError}</div>}

            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="modal-save" onClick={handleSave}>
                {editing ? "Guardar Cambios" : "Crear Horario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
