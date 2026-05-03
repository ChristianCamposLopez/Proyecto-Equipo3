// app/api/products/stock/summary/route.ts
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

    const summary = await stockService.getStockSummary(parseInt(restaurantId, 10));
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[GET /api/products/stock/summary]', error);
    return NextResponse.json(
      { error: 'Error al obtener resumen' },
      { status: 500 }
    );
  }
}
