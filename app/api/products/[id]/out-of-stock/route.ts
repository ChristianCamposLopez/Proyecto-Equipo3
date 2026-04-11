// app/api/products/[id]/out-of-stock/route.ts
import { NextRequest } from 'next/server';
import { markOutOfStock } from '@/controllers/stockController';

interface Context {
  params: { id: string } | Promise<{ id: string }>;
}

async function resolveId(context: Context) {
  const { params } = context;
  const resolved = typeof params === 'object' && 'then' in params ? await params : params;
  return parseInt(resolved.id, 10);
}

export async function POST(req: NextRequest, context: Context) {
  const productId = await resolveId(context);
  if (isNaN(productId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }
  return markOutOfStock(req, productId);
}
