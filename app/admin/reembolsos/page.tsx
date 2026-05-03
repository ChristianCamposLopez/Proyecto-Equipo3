// app/reembolsos/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .admin-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 48px 24px;
  }

  .admin-header {
    margin-bottom: 48px;
    border-bottom: 1px solid #2A2620;
    padding-bottom: 24px;
  }

  .admin-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .admin-title {
    font-family: 'Playfair Display', serif;
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .admin-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .refund-card {
    background: #1A1714;
    border-radius: 20px;
    border: 1px solid #2A2620;
    padding: 24px;
    margin-bottom: 20px;
    transition: all 0.2s;
  }

  .refund-card:hover {
    border-color: #C17A3A;
    background: #1F1C18;
  }

  .refund-header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: baseline;
    margin-bottom: 16px;
  }

  .refund-id {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
  }

  .refund-date {
    font-size: 13px;
    color: #7A7268;
  }

  .refund-customer {
    font-size: 15px;
    margin-bottom: 8px;
    color: #C17A3A;
  }

  .refund-amount {
    font-size: 28px;
    font-weight: bold;
    margin: 16px 0;
  }

  .button-group {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .btn-approve {
    background: #2C4C3B;
    border: none;
    color: #F2EDE4;
    padding: 10px 24px;
    border-radius: 40px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
  }

  .btn-approve:hover {
    background: #3E6B53;
  }

  .btn-reject {
    background: transparent;
    border: 1px solid #8B3A3A;
    color: #E5A1A1;
    padding: 10px 24px;
    border-radius: 40px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
  }

  .btn-reject:hover {
    background: #2A1A1A;
    border-color: #C17A3A;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    gap: 16px;
  }

  .loader {
    width: 32px;
    height: 32px;
    border: 2px solid #2A2620;
    border-top-color: #C17A3A;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty {
    text-align: center;
    padding: 80px 20px;
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    color: #3A3630;
    font-style: italic;
  }

  .error-banner {
    background: #3A1E1E;
    border-left: 4px solid #E5A1A1;
    padding: 12px 20px;
    border-radius: 12px;
    margin-bottom: 24px;
    color: #F2EDE4;
  }

  .reject-modal {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: #1A1714;
    border: 1px solid #2A2620;
    border-radius: 24px;
    padding: 32px;
    width: 90%;
    max-width: 500px;
  }

  .modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    margin-bottom: 20px;
  }

  .modal-textarea {
    width: 100%;
    background: #111010;
    border: 1px solid #2A2620;
    color: #F2EDE4;
    padding: 12px;
    border-radius: 12px;
    font-family: inherit;
    margin: 16px 0;
    resize: vertical;
  }

  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  }
`;

type PendingRefund = {
  order_id: number;
  customer_id: number;
  customer_name: string;
  total_amount: string;
  created_at: string;
  status: string; // 'CANCELLED'
};

export default function ReembolsosPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [adminId, setAdminId] = useState<number | null>(null); // ID real del admin
  const [refunds, setRefunds] = useState<PendingRefund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // 1. Recuperar el ID del administrador al cargar
  useEffect(() => {
    const savedId = sessionStorage.getItem('userId');
    if (savedId) {
      setAdminId(parseInt(savedId));
    }
  }, []);

  // 2. Cargar solicitudes (Enviando adminId por Query String)
  const fetchPending = useCallback(async () => {
    if (!adminId) return; // No disparar si no hay ID

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/reembolsos?adminId=${adminId}`);
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar solicitudes');
      
      setRefunds(data.refunds || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  // 3. Efecto para disparar la carga inicial
  useEffect(() => {
    if (adminId) {
      fetchPending();
    }
  }, [adminId, fetchPending]);

  // 4. Aprobar (Enviando adminId en el Body)
  const handleApprove = async (orderId: number) => {
    if (!adminId) return;
    
    setProcessingId(orderId);
    setError(null);
    try {
      const res = await fetch(`/api/reembolsos/${orderId}/process`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'approve',
          adminId: adminId // 👈 ID Real
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al aprobar');

      setRefunds(prev => prev.filter(r => r.order_id !== orderId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // 5. Rechazar (Enviando adminId en el Body)
  const handleReject = async (orderId: number) => {
    if (!adminId) return;
    if (!rejectReason.trim()) {
      setError('Debes escribir un motivo de rechazo');
      return;
    }

    setProcessingId(orderId);
    try {
      const res = await fetch(`/api/reembolsos/${orderId}/process`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reject', 
          reason: rejectReason.trim(),
          adminId: adminId // 👈 ID Real
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al rechazar');

      setRefunds(prev => prev.filter(r => r.order_id !== orderId));
      setShowRejectModal(null);
      setRejectReason('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-MX');
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

  if (!authorized) return null; // 👈 Evita el parpadeo de contenido

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="admin-container">
          <div className="loading">
            <div className="loader" />
            <span>Cargando solicitudes de reembolso...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-label">Panel de administración</div>
          <h1 className="admin-title">
            Reembolsos <em>pendientes</em>
          </h1>
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button
              onClick={() => setError(null)}
              style={{ float: 'right', background: 'none', border: 'none', color: '#E5A1A1', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        {refunds.length === 0 ? (
          <div className="empty">
            No hay pedidos pendientes de reembolso.
          </div>
        ) : (
          <div>
            {refunds.map(refund => (
              <div key={refund.order_id} className="refund-card">
                <div className="refund-header">
                  <span className="refund-id">PedidoEntity #{refund.order_id}</span>
                  <span className="refund-date">{formatDate(refund.created_at)}</span>
                </div>
                <div className="refund-customer">Cliente: {refund.customer_name}</div>
                <div className="refund-amount">
                  ${Number(refund.total_amount).toFixed(2)} MXN
                </div>
                <div className="button-group">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(refund.order_id)}
                    disabled={processingId === refund.order_id}
                  >
                    {processingId === refund.order_id ? 'Procesando...' : '✅ Aprobar reembolso'}
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => setShowRejectModal(refund.order_id)}
                    disabled={processingId === refund.order_id}
                  >
                    ❌ Rechazar reembolso
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para rechazar con motivo */}
      {showRejectModal !== null && (
        <div className="reject-modal" onClick={() => setShowRejectModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Motivo del rechazo</div>
            <p style={{ fontSize: '14px', color: '#7A7268', marginBottom: '8px' }}>
              Este motivo será visible para el cliente.
            </p>
            <textarea
              className="modal-textarea"
              rows={4}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Ej: Cancelación fuera del plazo permitido, pedido ya en preparación, etc."
            />
            <div className="modal-buttons">
              <button
                style={{ background: 'transparent', border: '1px solid #2A2620', padding: '8px 16px', borderRadius: '40px', cursor: 'pointer' }}
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-reject"
                onClick={() => handleReject(showRejectModal)}
                style={{ background: '#8B3A3A', border: 'none', color: 'white' }}
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}