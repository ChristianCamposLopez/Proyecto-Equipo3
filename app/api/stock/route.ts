// app/api/stock/route.ts
// [CÓDIGO AUXILIAR]: Endpoint para listar todos los productos con su estado de stock.

import { NextResponse } from 'next/server';
import { StockService } from '@/services/StockService';

const stockService = new StockService();

/**
 * GET /api/stock
 * Lista todos los productos con su estado de disponibilidad.
 */
export async function GET() {
  try {
    const products = await stockService.getAllProductsWithStatus();
    return NextResponse.json(products);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
