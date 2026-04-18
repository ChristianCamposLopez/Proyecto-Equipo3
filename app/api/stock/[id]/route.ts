// app/api/stock/[id]/route.ts
// API Route — US008: Marcar plato como agotado

import { NextRequest, NextResponse } from 'next/server';
import { StockService } from '@/services/StockService';

const stockService = new StockService();

/**
 * PATCH /api/stock/[id]
 * US008: Cambia disponibilidad de un producto.
 * Body: { is_available: boolean }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { is_available } = body;

    if (typeof is_available !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo requerido: is_available (boolean)' },
        { status: 400 }
      );
    }

    await stockService.toggleAvailability(parseInt(id, 10), is_available);
    const updated = await stockService.getProductStatus(parseInt(id, 10));

    return NextResponse.json(updated);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    const statusCode = mensaje.includes('no encontrado') ? 404 : 500;
    return NextResponse.json({ error: mensaje }, { status: statusCode });
  }
}

/**
 * GET /api/stock/[id]
 * Obtiene el estado actual de disponibilidad de un producto.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const status = await stockService.getProductStatus(parseInt(id, 10));
    return NextResponse.json(status);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: mensaje }, { status: 404 });
  }
}
