// app/api/kitchen/orders/[id]/status/route.ts
// API Route — US004: Actualizar estado de pedido en cocina

import { NextRequest, NextResponse } from 'next/server';
import { KitchenService } from '@/services/KitchenService';

const kitchenService = new KitchenService();

/**
 * PATCH /api/kitchen/orders/[id]/status
 * US004: Actualiza el estado de un pedido.
 * Body: { status: 'PREPARING' | 'READY' | 'COMPLETED' }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Campo requerido: status' },
        { status: 400 }
      );
    }

    await kitchenService.updateOrderStatus(parseInt(id, 10), status);

    return NextResponse.json({ message: `Pedido ${id} actualizado a ${status}` });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    const statusCode = mensaje.includes('no encontrado') ? 404 : 400;
    return NextResponse.json({ error: mensaje }, { status: statusCode });
  }
}
