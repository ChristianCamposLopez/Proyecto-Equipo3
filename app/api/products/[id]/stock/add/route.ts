// app/api/products/[id]/stock/add/route.ts
import { NextRequest } from 'next/server';
import { addProductStock } from '@/controllers/stockController';

interface Context {
  params: { id: string } | Promise<{ id: string }>;
}

async function resolveId(context: Context) {
  const { params } = context;
  const resolved = typeof params === 'object' && 'then' in params ? await params : params;
  return parseInt(resolved.id, 10);
}

// POST /api/products/[id]/stock/add — Agregar stock (reabastecimiento)
export async function POST(req: NextRequest, context: Context) {
  const productId = await resolveId(context);
  if (isNaN(productId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }
  return addProductStock(req, productId);
}
