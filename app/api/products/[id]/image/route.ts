// app/api/products/[id]/image/route.ts
import { NextRequest } from 'next/server';
import {
  getProductImage,
  uploadProductImage,
  deleteProductImage,
} from '@/controllers/productImageController';

// Handler context types from Next.js may wrap params in a promise
interface Context {
  params: { id: string } | Promise<{ id: string }>;
}

// helper to extract id
async function resolveId(context: Context) {
  const { params } = context;
  const resolved = typeof params === 'object' && 'then' in params ? await params : params;
  return parseInt(resolved.id, 10);
}

// US009.1 — Cliente ve la imagen de un platillo
export async function GET(req: NextRequest, context: Context) {
  const productId = await resolveId(context);
  if (isNaN(productId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }
  return getProductImage(req, productId);
}

// US009.2 — Admin sube imagen a un platillo
export async function POST(req: NextRequest, context: Context) {
  const productId = await resolveId(context);
  if (isNaN(productId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }
  return uploadProductImage(req, productId);
}

// US009.3 — Admin elimina imagen de un platillo
export async function DELETE(req: NextRequest, context: Context) {
  const productId = await resolveId(context);
  if (isNaN(productId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }
  return deleteProductImage(req, productId);
}