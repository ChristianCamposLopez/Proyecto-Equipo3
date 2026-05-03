// app/api/orders/pending/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PedidoService } from '@/services/PedidoService';

const pedidoService = new PedidoService();

export async function GET(req: NextRequest) {
  try {
    // Obtener restaurantId de query params
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Se requiere restaurantId' },
        { status: 400 }
      );
    }

    const orders = await pedidoService.getPendingOrders(parseInt(restaurantId, 10));
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('[GET /api/orders/pending]', error);
    return NextResponse.json(
      { error: 'Error al obtener órdenes pendientes' },
      { status: 500 }
    );
  }
}
