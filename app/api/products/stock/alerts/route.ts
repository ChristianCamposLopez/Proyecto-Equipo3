// app/api/products/stock/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStockAlerts } from '@/controllers/stockController';

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

    return getStockAlerts(req, parseInt(restaurantId, 10));
  } catch (error) {
    console.error('[GET /api/products/stock/alerts]', error);
    return NextResponse.json(
      { error: 'Error al obtener alertas' },
      { status: 500 }
    );
  }
}
