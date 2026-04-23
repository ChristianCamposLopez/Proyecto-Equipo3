// app/api/products/stock/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStockSummary } from '@/controllers/stockController';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Se requiere restaurantId' },
        { status: 400 }
      );
    }

    return getStockSummary(req, parseInt(restaurantId, 10));
  } catch (error) {
    console.error('[GET /api/products/stock/summary]', error);
    return NextResponse.json(
      { error: 'Error al obtener resumen' },
      { status: 500 }
    );
  }
}
