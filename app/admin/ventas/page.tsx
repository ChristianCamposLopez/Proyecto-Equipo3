// app/admin/ventas/page.tsx
'use client';

import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';
import { VentaDiaria } from '@/models/entities';

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

  /* Grupo de acciones */
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

  /* Pie */
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

  .empty-message {
    color: #3A3630;
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-style: italic;
    padding: 40px;
    text-align: center;
    border: 1px dashed #2A2620;
  }

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



export default function VentasPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const RESTAURANT_ID = 1; // Fijo por ahora

  // Estados
  const [fecha, setFecha] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]; // hoy
  });
  const [loading, setLoading] = useState(false);
  const [reporte, setReporte] = useState<VentaDiaria | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');

  const fetchReporte = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/ventas/diario', window.location.origin);
      url.searchParams.append('fecha', fecha);
      url.searchParams.append('restauranteId', RESTAURANT_ID.toString());

      const response = await fetch(url.toString());
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || result.mensaje || 'Error al obtener reporte');

      setReporte(result.data);
      setRestaurantName(result.meta?.restaurantName || `ID: ${RESTAURANT_ID}`);
    } catch (err: any) {
      setError(err.message);
      setReporte(null);
    } finally {
      setLoading(false);
    }
  };

  // Exportación cliente (XLSX / PDF)
  const handleExport = (format: 'excel' | 'pdf') => {
    if (!reporte) return;

    const dataToExport = [reporte];
    const metadata = {
      restaurantName: restaurantName || `ID: ${RESTAURANT_ID}`,
      fecha,
    };

    if (format === 'excel') {
      const excelData = [
        ['REPORTE DE VENTAS DIARIAS'],
        [''],
        ['Restaurante:', metadata.restaurantName],
        ['Fecha:', metadata.fecha],
        [''],
        ['Total Pedidos', 'Total Ventas'],
        [
          reporte.numero_pedidos.toString(),
          `$${reporte.total_ventas.toFixed(2)}`,
          `$${(reporte.average_ticket || 0).toFixed(2)}`,
          `$${(reporte.max_sale || 0).toFixed(2)}`,
          `$${(reporte.min_sale || 0).toFixed(2)}`,
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
      XLSX.writeFile(wb, `ventas_${fecha}.xlsx`);
    } else {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Ventas Diarias', 14, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Restaurante: ${metadata.restaurantName}`, 14, 30);
      doc.text(`Fecha: ${metadata.fecha}`, 14, 37);
      const body = [
        ['Total Pedidos', reporte.numero_pedidos.toString()],
        ['Total Ventas', `$${reporte.total_ventas.toFixed(2)}`],
      ];
      autoTable(doc, {
        startY: 45,
        head: [['Concepto', 'Valor']],
        body,
        theme: 'striped',
        headStyles: {
          fillColor: [193, 122, 58],
          textColor: [17, 16, 16],
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60 },
        },
        styles: { fontSize: 10, cellPadding: 4 },
      });
      doc.save(`ventas_${fecha}.pdf`);
    }
  };

  useEffect(() => {
        // 🛡️ Guardia de seguridad
        const role = sessionStorage.getItem('userRole');
        if (role !== 'admin' && role !== 'restaurant_admin') {
          router.replace('/login');
        } else {
          setAuthorized(true);
          // Aquí puedes disparar tus fetch iniciales
        }
      }, [router]);
    
  if (!authorized) return null; 

  return (
    <>
      <style>{styles}</style>
      <div className="edit-root">
        <div className="edit-hero">
          <div className="edit-label">Contabilidad</div>
          <h1 className="edit-title">
            Reporte de <em>ventas diarias</em>
          </h1>
          <p className="edit-subtitle">
            Consulta el resumen de pedidos y ventas de un día concreto para tu
            control contable.
          </p>
        </div>

        <div className="edit-content">
          <div className="edit-section">
            <h2 className="edit-section-title">
              Fecha de consulta <span>╱ selecciona el día</span>
            </h2>
            <div className="form-row">
              <input
                type="date"
                className="edit-input"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
              <button
                className="edit-btn primary"
                onClick={fetchReporte}
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Consultar'}
              </button>
            </div>
          </div>

          {reporte && !loading && (
            <div className="edit-section" style={{ marginBottom: '24px' }}>
              <div
                className="action-group"
                style={{ justifyContent: 'flex-end' }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    color: '#7A7268',
                    alignSelf: 'center',
                    marginRight: '10px',
                  }}
                >
                  EXPORTAR:
                </span>
                <button
                  onClick={() => handleExport('excel')}
                  className="edit-btn"
                  style={{ borderColor: '#2e7d32', color: '#2e7d32' }}
                >
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="edit-btn"
                  style={{ borderColor: '#b34a4a', color: '#b34a4a' }}
                >
                  PDF (.pdf)
                </button>
              </div>
            </div>
          )}

          <div className="edit-section">
            <h2 className="edit-section-title">
              Resultado <span>╱ detalle del día</span>
            </h2>

            {error && (
              <div
                style={{
                  color: '#B34A4A',
                  marginBottom: '24px',
                  padding: '12px',
                  border: '1px solid #B34A4A',
                  borderRadius: '2px',
                }}
              >
                {error}
              </div>
            )}

            {!loading && !reporte && !error && (
              <div className="empty-message">
                Selecciona una fecha y haz clic en Consultar.
              </div>
            )}

            {reporte && (
              <table
                style={{ width: '100%', borderCollapse: 'collapse' }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid #2A2620' }}>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px 8px',
                        fontWeight: 500,
                        color: '#C17A3A',
                      }}
                    >
                      Concepto
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '12px 8px',
                        fontWeight: 500,
                        color: '#C17A3A',
                      }}
                    >
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #1E1C19' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                      Número de pedidos
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'right',
                        fontWeight: 500,
                      }}
                    >
                      {reporte.numero_pedidos}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1E1C19' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                      Ventas totales
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'right',
                        fontWeight: 500,
                      }}
                    >
                      ${reporte.total_ventas.toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1E1C19' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                      Ticket Promedio
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'right',
                        fontWeight: 500,
                      }}
                    >
                      ${(reporte.average_ticket || 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1E1C19' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                      Venta Máxima
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'right',
                        fontWeight: 500,
                      }}
                    >
                      ${(reporte.max_sale || 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1E1C19' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                      Venta Mínima
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'right',
                        fontWeight: 500,
                      }}
                    >
                      ${(reporte.min_sale || 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="edit-footer">
          <span>{restaurantName || `Restaurante ID: ${RESTAURANT_ID}`}</span>
          <span>Sistema de Gestión de Restaurantes</span>
        </div>
      </div>
    </>
  );
}