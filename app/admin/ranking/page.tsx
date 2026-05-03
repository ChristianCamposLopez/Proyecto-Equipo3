// app/admin/restaurantes/[restaurantid]/ranking/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { ExportService, ExportData, ExportMetadata } from '@/services/ExportService';
import { useEffect, useState } from 'react';

// Inyectar estilos (proporcionados)
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .edit-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
    padding-bottom: 48px;
  }

  /* Hero */
  .edit-hero {
    position: relative;
    padding: 72px 48px 48px;
    border-bottom: 1px solid #2A2620;
    overflow: hidden;
    animation: fadeDown 0.7s ease both;
  }

  .edit-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, #3D1F0A44, transparent);
    pointer-events: none;
  }

  .edit-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .edit-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .edit-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .edit-subtitle {
    margin-top: 16px;
    font-size: 14px;
    color: #7A7268;
    font-weight: 300;
    max-width: 420px;
    line-height: 1.6;
  }

  /* Contenido principal */
  .edit-content {
    padding: 32px 48px;
    animation: fadeUp 0.6s 0.1s ease both;
  }

  /* Secciones */
  .edit-section {
    margin-bottom: 48px;
  }

  .edit-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 24px;
    letter-spacing: -0.02em;
    border-bottom: 1px solid #2A2620;
    padding-bottom: 12px;
  }

  .edit-section-title span {
    color: #C17A3A;
    font-style: italic;
    font-weight: 400;
    margin-left: 8px;
  }

  /* Grupo de acciones (botones) */
  .action-group {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 32px;
  }

  /* Botones */
  .edit-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 12px 24px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px;
    background: transparent;
    border: 1px solid #2A2620;
    color: #7A7268;
  }

  .edit-btn:hover {
    border-color: #C17A3A;
    color: #C17A3A;
  }

  .edit-btn.primary {
    background: #C17A3A;
    border-color: #C17A3A;
    color: #111010;
  }

  .edit-btn.primary:hover {
    background: #D68F4A;
    border-color: #D68F4A;
  }

  .edit-btn.warning {
    border-color: #B34A4A;
    color: #B34A4A;
  }

  .edit-btn.warning:hover {
    background: #B34A4A;
    color: #111010;
  }

  .edit-btn.danger {
    background: #111010;
    border-color: #7A7268;
    color: #F2EDE4;
  }

  .edit-btn.danger:hover {
    background: #2A2620;
    border-color: #F2EDE4;
  }

  /* Campos de formulario */
  .form-row {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .edit-input {
    background: #1A1714;
    border: 1px solid #2A2620;
    padding: 12px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #F2EDE4;
    border-radius: 2px;
    min-width: 240px;
    flex: 1;
  }

  .edit-input:focus {
    outline: none;
    border-color: #C17A3A;
  }

  .edit-input::placeholder {
    color: #4A4540;
    font-weight: 300;
  }

  /* File input */
  .file-input-wrapper {
    position: relative;
    display: inline-block;
  }

  .file-input-wrapper input[type="file"] {
    position: absolute;
    left: -9999px;
    opacity: 0;
  }

  .file-label {
    display: inline-block;
    background: #1A1714;
    border: 1px solid #2A2620;
    padding: 12px 24px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #7A7268;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px;
  }

  .file-label:hover {
    border-color: #C17A3A;
    color: #C17A3A;
  }

  .file-name {
    margin-left: 16px;
    font-size: 12px;
    color: #7A7268;
    font-style: italic;
  }

  /* Grid de imágenes */
  .images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 24px;
    margin-top: 24px;
  }

  .image-card {
    background: #1A1714;
    border: 1px solid #2A2620;
    border-radius: 2px;
    overflow: hidden;
    transition: all 0.2s;
  }

  .image-card:hover {
    border-color: #C17A3A;
    transform: translateY(-2px);
  }

  .image-card img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    display: block;
  }

  .image-actions {
    padding: 12px;
  }

  .image-actions .edit-btn {
    width: 100%;
    text-align: center;
    padding: 8px;
    font-size: 11px;
  }

  .empty-message {
    color: #3A3630;
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-style: italic;
    padding: 40px;
    text-align: center;
    border: 1px dashed #2A2620;
  }

  /* Footer */
  .edit-footer {
    padding: 24px 48px 0;
    border-top: 1px solid #1E1C19;
    font-size: 11px;
    color: #3A3630;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    animation: fadeUp 0.6s 0.3s ease both;
  }

  /* Animaciones */
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 600px) {
    .edit-hero { padding: 48px 24px 32px; }
    .edit-content { padding: 24px; }
    .form-row { flex-direction: column; align-items: stretch; }
    .edit-input { width: 100%; }
    .edit-footer { padding: 20px 24px; flex-direction: column; gap: 8px; }
  }
`;

/*
interface RankedProduct {
  product_id: number;
  product_name: string;
  total_quantity_sold: number;
}

export default function RankingPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  // Estados del formulario
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [topN, setTopN] = useState<number>(5);

  // Estado de la petición
  const [loading, setLoading] = useState<boolean>(false);
  const [ranking, setRanking] = useState<RankedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRanking = async () => {
    console.log('CLICK'); // 👈 DEBUG

    if (!restaurantId) {
        console.log('No hay restaurantId');
        return;
    }

    setLoading(true);
    setError(null);

    try {
      // Construir URL con parámetros
      const url = new URL('/api/ranking', window.location.origin);
      url.searchParams.append('restaurantId', restaurantId);
      url.searchParams.append('startDate', new Date(startDate).toISOString());
      url.searchParams.append('endDate', new Date(endDate).toISOString());
      url.searchParams.append('topN', topN.toString());

      const response = await fetch(url.toString());
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener el ranking');
      }

      setRanking(result.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="edit-root">
        <div className="edit-hero">
          <div className="edit-label">Analytics</div>
          <h1 className="edit-title">
            Ranking de <em>ventas</em>
          </h1>
          <p className="edit-subtitle">
            Descubre los platos más vendidos y toma decisiones estratégicas para tu menú.
          </p>
        </div>

        <div className="edit-content">
          <div className="edit-section">
            <h2 className="edit-section-title">
              Filtros <span>╱ período y límite</span>
            </h2>
            <div className="action-group">
              <div className="form-row">
                <input
                  type="date"
                  className="edit-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="edit-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <input
                  type="number"
                  className="edit-input"
                  placeholder="Top N (ej. 10)"
                  value={topN}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setTopN(isNaN(value) ? 5 : value);
                  }}
                  min={1}
                />
                <button
                  className="edit-btn primary"
                  onClick={fetchRanking}
                  disabled={loading}
                >
                  {loading ? 'Consultando...' : 'Consultar ranking'}
                </button>
              </div>
            </div>
          </div>

          <div className="edit-section">
            <h2 className="edit-section-title">
              Resultados <span>╱ platos más pedidos</span>
            </h2>

            {error && (
              <div style={{ color: '#B34A4A', marginBottom: '24px', padding: '12px', border: '1px solid #B34A4A', borderRadius: '2px' }}>
                {error}
              </div>
            )}

            {!loading && ranking.length === 0 && !error && (
              <div className="empty-message">
                No hay ventas en el período seleccionado.
              </div>
            )}

            {ranking.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2A2620' }}>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 500, color: '#C17A3A' }}>Posición</th>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 500, color: '#C17A3A' }}>Plato</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 500, color: '#C17A3A' }}>Cantidad vendida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((item, index) => (
                      <tr key={item.product_id} style={{ borderBottom: '1px solid #1E1C19' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 400, color: '#7A7268' }}>#{index + 1}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 500 }}>{item.product_name}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>{item.total_quantity_sold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {loading && (
              <div className="empty-message" style={{ animation: 'none' }}>
                Cargando ranking...
              </div>
            )}
          </div>
        </div>

        <div className="edit-footer">
          <span>RESTAURANT ID: {restaurantId}</span>
          <span>Ranking actualizado en tiempo real</span>
        </div>
      </div>
    </>
  );
}
  */


interface RankedProduct {
  product_id: number;
  product_name: string;
  total_quantity_sold: number;
}

export default function RankingPage() {
  // 1. Ya no dependemos de useParams, fijamos la constante
  const RESTAURANT_ID = 1;

  // Estados (se mantienen igual para las fechas)
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [topN, setTopN] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [ranking, setRanking] = useState<RankedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');

  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole'); // Idealmente guardas el rol al loguear

    // Si no hay ID o el rol no es ADMIN, para afuera
    if (!userId || userRole !== 'restaurant_admin') {
      router.push('/login');
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  // Si aún está validando, no mostramos NADA
  if (!isAdmin) return <div className="loading">Verificando credenciales...</div>;

  const fetchRanking = async () => {
    // Validación de fechas
    if (new Date(startDate) >= new Date(endDate)) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/ranking', window.location.origin);
      
      // Usamos la constante RESTAURANT_ID directamente
      url.searchParams.append('startDate', new Date(startDate + 'T00:00:00').toISOString());
      url.searchParams.append('endDate', new Date(endDate + 'T23:59:59').toISOString());
      url.searchParams.append('endDate', endDate);
      url.searchParams.append('topN', topN.toString());

      const response = await fetch(url.toString());
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Error en el servidor');

      setRanking(result.data || []);
      setRestaurantName(result.meta?.restaurantName || '');
    } catch (err: any) {
      setError(err.message);
      setRanking([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (ranking.length === 0) return;

    const dataToExport: ExportData[] = ranking.map((item, index) => ({
      product_name: item.product_name,
      total_quantity_sold: item.total_quantity_sold,
      position: index + 1
    }));

    const metadata: ExportMetadata = {
      restaurantName: restaurantName || `ID: ${1}`,
      startDate,
      endDate,
      generatedAt: new Date().toLocaleString(),
      topN,
      totalProducts: ranking.length
    };

    ExportService.export(dataToExport, metadata, format);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="edit-root">
        <div className="edit-hero">
          <div className="edit-label">Analytics</div>
          <h1 className="edit-title">Ranking de <em>ventas</em></h1>
          <p className="edit-subtitle">
            {restaurantName && `Restaurante: ${restaurantName} • `}
            Descubre los platos más vendidos y toma decisiones estratégicas para tu menú.
          </p>
        </div>

        <div className="edit-content">
          <div className="edit-section">
            <h2 className="edit-section-title">Filtros <span>╱ período y límite</span></h2>
            <div className="action-group">
              <div className="form-row">
                <input type="date" className="edit-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" className="edit-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <input type="number" className="edit-input" value={topN} onChange={(e) => setTopN(parseInt(e.target.value) || 5)} min={1} />
                <button className="edit-btn primary" onClick={fetchRanking} disabled={loading}>
                  {loading ? 'Consultando...' : 'Consultar ranking'}
                </button>
              </div>
            </div>
          </div>

          {ranking.length > 0 && !loading && (
            <div className="edit-section" style={{ marginBottom: '24px' }}>
              <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '12px', color: '#7A7268', alignSelf: 'center', marginRight: '10px' }}>
                  EXPORTAR RESULTADOS:
                </span>
                <button onClick={() => handleExport('excel')} className="edit-btn" style={{ borderColor: '#2e7d32', color: '#2e7d32' }}>
                  Excel (.xlsx)
                </button>
                <button onClick={() => handleExport('pdf')} className="edit-btn" style={{ borderColor: '#b34a4a', color: '#b34a4a' }}>
                  PDF (.pdf)
                </button>
              </div>
            </div>
          )}

          <div className="edit-section">
            <h2 className="edit-section-title">Resultados <span>╱ platos más pedidos</span></h2>

            {error && (
              <div style={{ color: '#B34A4A', marginBottom: '24px', padding: '12px', border: '1px solid #B34A4A', borderRadius: '2px' }}>
                {error}
              </div>
            )}

            {!loading && ranking.length === 0 && !error && (
              <div className="empty-message">
                No hay ventas en el período seleccionado.
              </div>
            )}

            {ranking.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2A2620' }}>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 500, color: '#C17A3A' }}>Posición</th>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 500, color: '#C17A3A' }}>Plato</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 500, color: '#C17A3A' }}>Cantidad vendida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((item, index) => (
                      <tr key={item.product_id} style={{ borderBottom: '1px solid #1E1C19' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 400, color: '#7A7268' }}>#{index + 1}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 500 }}>{item.product_name}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>{item.total_quantity_sold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {loading && (
              <div className="empty-message" style={{ animation: 'none' }}>
                Cargando ranking...
              </div>
            )}
          </div>
        </div>

        <div className="edit-footer">
          <span>{restaurantName || `Restaurante ID: ${1}`}</span>
          <span>Ranking actualizado en tiempo real</span>
        </div>
      </div>
    </>
  );
}
