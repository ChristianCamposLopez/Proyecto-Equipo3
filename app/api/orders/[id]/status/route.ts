// app/api/orders/[id]/status/route.ts
import { NextRequest } from 'next/server';
import { updateOrderStatus } from '@/controllers/orderController';

interface Context {
  params: { id: string } | Promise<{ id: string }>;
}

async function resolveId(context: Context) {
  const { params } = context;
  const resolved = typeof params === 'object' && 'then' in params ? await params : params;
  return parseInt(resolved.id, 10);
}

// Actualizar estado de un pedido
export async function PUT(req: NextRequest, context: Context) {
  const orderId = await resolveId(context);
  if (isNaN(orderId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }
  return updateOrderStatus(req, orderId);
}
