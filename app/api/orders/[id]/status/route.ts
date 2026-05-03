// app/api/orders/[id]/status/route.ts
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

// Actualizar estado de un pedido
export async function PUT(req: NextRequest, context: Context) {
  const orderId = await resolveId(context);
  if (isNaN(orderId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }
  try {
    const { status } = await req.json();
    const updated = await pedidoService.updateOrderStatus(orderId, status);
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
