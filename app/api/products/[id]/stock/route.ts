// app/api/products/[id]/stock/route.ts
import { NextRequest } from 'next/server';
import { StockDAO } from '@/models/daos/StockDAO';

interface Context {
  params: { id: string } | Promise<{ id: string }>;
}

const dao = new StockDAO();

async function resolveId(context: Context) {
  const { params } = context;
  const resolved = typeof params === 'object' && 'then' in params ? await params : params;
  return parseInt(resolved.id, 10);
}

// GET /api/products/[id]/stock — Obtener información de stock
export async function GET(req: NextRequest, context: Context) {
  try {
    const productId = await resolveId(context);
    if (isNaN(productId)) {
      return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
    }

    const product = await dao.getProductWithStock(productId);
    if (!product) {
      return new Response(JSON.stringify({ error: 'Producto no encontrado' }), { status: 404 });
    }

    return new Response(JSON.stringify(product), { status: 200 });
  } catch (error) {
    console.error('[GET /api/products/[id]/stock]', error);
    return new Response(JSON.stringify({ error: 'Error al obtener stock' }), { status: 500 });
  }
}
