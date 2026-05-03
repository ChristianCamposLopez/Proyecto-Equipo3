"use client"
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function RestaurantConfig() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const savedId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');
    const isAdmin = userRole === 'admin' || userRole === 'restaurant_admin';
    
    if (!savedId || !isAdmin) {
      router.replace('/login'); 
    } else {
      setAuthorized(true);
      fetchRestaurant(savedId);
    }
  }, [router]);

  const fetchRestaurant = async (ownerId: string) => {
    try {
      const res = await fetch(`/api/restaurant?ownerId=${ownerId}`);
      if (res.ok) {
        const data = await res.json();
        setRestaurant(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("Guardando...");
    try {
      const res = await fetch('/api/restaurant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurant)
      });
      if (res.ok) setFeedback("Configuración actualizada correctamente");
      else setFeedback("Error al actualizar");
    } catch (err) {
      setFeedback("Error de conexión");
    }
  };

  if (!authorized) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="menu-root">
        <header className="menu-hero">
          <div className="menu-topbar">
            <div>
              <p className="menu-label">Configuración del Negocio</p>
              <h1 className="menu-title">Perfil del <em>Restaurante</em></h1>
              <p className="menu-subtitle">
                Administre la identidad de su establecimiento, horarios de atención y estado operativo.
              </p>
            </div>
            <div className="cart-chip">
              <p className="cart-chip-label">Estado Actual</p>
              <div className="cart-chip-total">{restaurant?.is_active ? 'Abierto' : 'Cerrado'}</div>
              <button 
                onClick={() => setRestaurant({...restaurant, is_active: !restaurant.is_active})}
                className="add-btn" 
                style={{ marginTop: '12px', width: '100%' }}
              >
                {restaurant?.is_active ? 'Cerrar Restaurante' : 'Abrir Restaurante'}
              </button>
            </div>
          </div>
        </header>

        <main style={{ padding: '48px' }}>
          {loading ? (
            <div className="menu-loading">Cargando datos...</div>
          ) : (
            <form onSubmit={handleUpdate} className="config-card">
              <div className="form-group">
                <label>Nombre Comercial</label>
                <input 
                  type="text" 
                  value={restaurant?.nombre || ''} 
                  onChange={(e) => setRestaurant({...restaurant, nombre: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Logo del Restaurante (URL)</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={restaurant?.logo_url || ''} 
                    onChange={(e) => setRestaurant({...restaurant, logo_url: e.target.value})}
                    style={{ flex: 1 }}
                  />
                  {restaurant?.logo_url && (
                    <img 
                      src={restaurant.logo_url} 
                      alt="Logo Preview" 
                      style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #C17A3A', objectFit: 'cover' }}
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>RFC / ID Fiscal (Único)</label>
                <input 
                  type="text" 
                  value={restaurant?.tax_id || ''} 
                  onChange={(e) => setRestaurant({...restaurant, tax_id: e.target.value})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div className="form-group">
                  <label>Latitud</label>
                  <input 
                    type="number" step="any"
                    value={restaurant?.latitude || ''} 
                    onChange={(e) => setRestaurant({...restaurant, latitude: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Longitud</label>
                  <input 
                    type="number" step="any"
                    value={restaurant?.longitude || ''} 
                    onChange={(e) => setRestaurant({...restaurant, longitude: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              {/* SECCIÓN DE HORARIOS (US025.4) */}
              <div style={{ marginTop: '32px', borderTop: '1px solid #2A2620', paddingTop: '32px' }}>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: '24px', marginBottom: '16px' }}>Horarios de Atención</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[1, 2, 3, 4, 5, 6, 0].map(dia => {
                    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                    const h = restaurant?.horarios?.find((item: any) => item.dia === dia) || { apertura: '09:00', cierre: '20:00' };
                    
                    return (
                      <div key={dia} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#A79D90' }}>{days[dia]}</span>
                        <input 
                          type="time" 
                          value={h.apertura}
                          onChange={(e) => {
                            const newHours = [...(restaurant.horarios || [])];
                            const idx = newHours.findIndex(item => item.dia === dia);
                            if (idx >= 0) newHours[idx].apertura = e.target.value;
                            else newHours.push({ dia, apertura: e.target.value, cierre: '20:00' });
                            setRestaurant({...restaurant, horarios: newHours});
                          }}
                        />
                        <input 
                          type="time" 
                          value={h.cierre}
                          onChange={(e) => {
                            const newHours = [...(restaurant.horarios || [])];
                            const idx = newHours.findIndex(item => item.dia === dia);
                            if (idx >= 0) newHours[idx].cierre = e.target.value;
                            else newHours.push({ dia, apertura: '09:00', cierre: e.target.value });
                            setRestaurant({...restaurant, horarios: newHours});
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {feedback && <p className="status-note">{feedback}</p>}

              <div className="card-actions">
                <button type="submit" className="add-btn" style={{ padding: '16px 32px' }}>
                  Guardar Cambios
                </button>
                <button 
                  type="button" 
                  onClick={() => router.back()}
                  style={{ background: 'transparent', color: '#C17A3A', border: '1px solid #C17A3A', marginLeft: '12px', padding: '16px 32px', borderRadius: '999px', cursor: 'pointer' }}
                >
                  Volver al Dashboard
                </button>
              </div>
            </form>
          )}
        </main>

        <footer className="menu-footer">
          <span>Configuración US025 — Proyecto Equipo 3</span>
          <span>Soporte Técnico Activo</span>
        </footer>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .menu-root {
    min-height: 100vh;
    background: radial-gradient(circle at top right, rgba(193, 122, 58, 0.16), transparent 28%), linear-gradient(180deg, #111010 0%, #171411 100%);
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .menu-hero { padding: 72px 48px 36px; border-bottom: 1px solid #2A2620; }
  .menu-topbar { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
  .menu-label { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #C17A3A; margin-bottom: 12px; }
  .menu-title { font-family: 'Playfair Display', serif; font-size: clamp(40px, 6vw, 72px); font-weight: 700; line-height: 1; }
  .menu-title em { font-style: italic; color: #C17A3A; }
  .menu-subtitle { margin-top: 16px; font-size: 14px; color: #A79D90; max-width: 480px; }

  .cart-chip { min-width: 280px; padding: 24px; border: 1px solid #3B2D21; background: rgba(20, 17, 14, 0.92); border-radius: 18px; }
  .cart-chip-label { font-size: 11px; text-transform: uppercase; color: #C17A3A; }
  .cart-chip-total { font-family: 'Playfair Display', serif; font-size: 34px; color: #F2EDE4; }

  .config-card { background: #111010; border: 1px solid #2A2620; padding: 40px; border-radius: 24px; max-width: 800px; margin: 0 auto; }
  .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
  .form-group label { font-size: 12px; text-transform: uppercase; color: #C17A3A; letter-spacing: 0.1em; }
  .form-group input { 
    background: #1A1714; border: 1px solid #3B2D21; padding: 16px; border-radius: 12px; color: #F2EDE4; font-family: inherit;
    outline: none; transition: border-color 0.3s;
  }
  .form-group input:focus { border-color: #C17A3A; }

  .add-btn { border: 0; border-radius: 999px; padding: 12px 16px; background: #C17A3A; color: #111010; font-size: 11px; font-weight: 700; cursor: pointer; text-transform: uppercase; }
  .status-note { color: #C17A3A; margin-top: 12px; font-size: 14px; }

  .menu-footer { padding: 24px 48px; border-top: 1px solid #1E1C19; font-size: 11px; color: #5D574F; display: flex; justify-content: space-between; }
`;
