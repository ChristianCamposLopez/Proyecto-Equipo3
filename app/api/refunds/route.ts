// app/api/refunds/route.ts — US026: Gestión de Reembolsos
import { NextRequest, NextResponse } from 'next/server';
import { RefundDAO } from '@/models/daos/RefundDAO';

const dao = new RefundDAO();

/**
 * GET /api/refunds — Obtener reembolsos pendientes
 * Query: restaurantId=1&type=pending|history
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = parseInt(searchParams.get('restaurantId') || '1');
    const type = searchParams.get('type') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (type === 'pending') {
      const refunds = await dao.getPendingRefunds(restaurantId);
      return NextResponse.json(refunds, { status: 200 });
    } else if (type === 'history') {
      const refunds = await dao.getRefundHistory(restaurantId, limit);
      return NextResponse.json(refunds, { status: 200 });
    } else if (type === 'stats') {
      const stats = await dao.getRefundStats(restaurantId);
      return NextResponse.json(stats, { status: 200 });
    }

    return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 });
  } catch (error) {
    console.error('[GET /api/refunds]', error);
    return NextResponse.json(
      { error: 'Error al obtener reembolsos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/refunds — Iniciar reembolso para orden cancelada
 * Body: { orderId, amount, reason }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, reason } = body;

    if (!orderId || !amount || !reason) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: orderId, amount, reason' },
        { status: 400 }
      );
    }

    const refund = await dao.initiateRefund(orderId, amount, reason);

    console.log(`[Refund] Reembolso iniciado para orden ${orderId}: $${amount}`);

    return NextResponse.json(refund, { status: 201 });
  } catch (error) {
    console.error('[POST /api/refunds]', error);
    const msg = error instanceof Error ? error.message : String(error);

    if (msg.includes('no encontrada') || msg.includes('no encontrado')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al iniciar reembolso' },
      { status: 500 }
    );
  }
}
