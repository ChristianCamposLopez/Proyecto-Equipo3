// app/api/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PedidoService } from '@/services/PedidoService';

const pedidoService = new PedidoService();

interface Context {
  params: Promise<{ id: string }>;
}

async function handleStatusUpdate(req: NextRequest, context: Context) {
  const { id } = await context.params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const { status, deliverymanId } = await req.json();
    
    // Si se envía deliverymanId, primero asignarlo
    if (deliverymanId) {
      const { db } = await import("@/config/db");
      await db.query("UPDATE orders SET deliveryman_id = $1 WHERE id = $2", [deliverymanId, orderId]);
    }

    const updated = await pedidoService.updateOrderStatus(orderId, status);
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("[STATUS UPDATE ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const PUT = handleStatusUpdate;
export const PATCH = handleStatusUpdate;
