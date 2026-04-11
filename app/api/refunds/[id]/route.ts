// app/api/refunds/[id]/route.ts — US026: Gestión de Reembolsos
import { NextRequest, NextResponse } from 'next/server';
import { RefundDAO } from '@/models/daos/RefundDAO';

const dao = new RefundDAO();

/**
 * POST /api/refunds/[id] — Actualizar estado de reembolso
 * Body: { action: 'approve' | 'reject' | 'process', rejectionReason? }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const refundId = parseInt(id);
    if (isNaN(refundId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const { action, rejectionReason } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Se requiere el campo action: approve | reject | process' },
        { status: 400 }
      );
    }

    let refund;

    switch (action) {
      case 'approve':
        refund = await dao.approveRefund(refundId);
        console.log(`[Refund] Reembolso ${refundId} aprobado`);
        break;

      case 'reject':
        refund = await dao.rejectRefund(refundId, rejectionReason);
        console.log(`[Refund] Reembolso ${refundId} rechazado`);
        break;

      case 'process':
        refund = await dao.processRefund(refundId);
        console.log(`[Refund] Reembolso ${refundId} procesado`);
        break;

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    return NextResponse.json(refund, { status: 200 });
  } catch (error) {
    console.error('[POST /api/refunds/[id]]', error);
    const msg = error instanceof Error ? error.message : String(error);

    if (msg.includes('no encontrado')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al procesar reembolso' },
      { status: 500 }
    );
  }
}
