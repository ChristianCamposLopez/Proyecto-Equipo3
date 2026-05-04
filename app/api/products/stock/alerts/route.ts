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
    
    const mappedAlerts = alerts.map((p: any) => ({
      product_id: p.id,
      name: p.name,
      current_stock: p.stock,
      threshold: 5,
      status: p.stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
    }));

    return NextResponse.json(mappedAlerts);
  } catch (error) {
    console.error('[GET /api/products/stock/alerts]', error);
    return NextResponse.json(
      { error: 'Error al obtener alertas' },
      { status: 500 }
    );
  }
}
