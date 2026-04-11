// app/api/orders/[id]/cancel/route.ts
import { NextRequest } from 'next/server';
import { cancelOrder } from '@/controllers/orderController';

interface Context {
  params: { id: string } | Promise<{ id: string }>;
}

async function resolveId(context: Context) {
  const { params } = context;
  const resolved = typeof params === 'object' && 'then' in params ? await params : params;
  return parseInt(resolved.id, 10);
}

// Cancelar un pedido
export async function POST(req: NextRequest, context: Context) {
  const orderId = await resolveId(context);
  if (isNaN(orderId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }
  return cancelOrder(req, orderId);
}
