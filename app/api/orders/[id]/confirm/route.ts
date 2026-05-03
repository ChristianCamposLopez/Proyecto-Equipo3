// app/api/orders/[id]/confirm/route.ts
import { NextRequest } from 'next/server';
import { PedidoService } from '@/services/PedidoService';

const pedidoService = new PedidoService();

interface Context {
  params: { id: string } | Promise<{ id: string }>;
}

async function resolveId(context: Context) {
  const { params } = context;
  const resolved = typeof params === 'object' && 'then' in params ? await params : params;
  return parseInt(resolved.id, 10);
}

// US011 — Admin confirma un pedido
export async function POST(req: NextRequest, context: Context) {
  const orderId = await resolveId(context);
  if (isNaN(orderId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }
  try {
    const confirmed = await pedidoService.confirmOrder(orderId);
    return new Response(JSON.stringify(confirmed), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
