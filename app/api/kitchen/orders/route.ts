// app/api/kitchen/orders/route.ts
// API Route — US004: Panel de Cocina

import { NextResponse } from 'next/server';
import { KitchenService } from '@/services/KitchenService';

const kitchenService = new KitchenService();

/**
 * GET /api/kitchen/orders
 * US004: Obtiene todos los pedidos activos con sus items para cocina.
 */
export async function GET() {
  try {
    const orders = await kitchenService.getActiveOrders();
    return NextResponse.json(orders);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
