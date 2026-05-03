// app/api/products/stock/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StockService } from '@/services/StockService';

const stockService = new StockService();

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

    const alerts = await stockService.getStockAlerts(parseInt(restaurantId, 10));
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('[GET /api/products/stock/alerts]', error);
    return NextResponse.json(
      { error: 'Error al obtener alertas' },
      { status: 500 }
    );
  }
}
