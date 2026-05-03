// controllers/orderController.ts
import { NextRequest, NextResponse } from 'next/server';
import { OrderDAO } from '@/models/daos/OrderDAO';
import { db } from '@/config/db';

const dao = new OrderDAO();

// ─── US011: GET /api/orders/pending ────────────────────────────────────────
/**
 * Obtener todas las órdenes pendientes de confirmación
 */
export async function getPendingOrders(
  _req: NextRequest,
  restaurantId: number
): Promise<NextResponse> {
  try {
    const orders = await dao.getPendingOrders(restaurantId);
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('[getPendingOrders]', error);
    return NextResponse.json(
      { error: 'Error al obtener órdenes pendientes' },
      { status: 500 }
    );
  }
}

// ─── US011: POST /api/orders/[id]/confirm ─────────────────────────────────
/**
 * Confirmar un pedido (cambiar estado de PENDING a CONFIRMED)
 * Validaciones:
 * - El pedido debe existir
 * - El estado debe ser PENDING
 * - Se notifica al sistema para procesamiento
 */
export async function confirmOrder(
  req: NextRequest,
  orderId: number
): Promise<NextResponse> {
  try {
    // Validar que el ID sea válido
    if (isNaN(orderId) || orderId <= 0) {
      return NextResponse.json(
        { error: 'ID de pedido inválido' },
        { status: 400 }
      );
    }

    // Confirmar el pedido
    const confirmedOrder = await dao.confirmOrder(orderId);

    // Descontar stock de productos en la orden
    await decreaseStockForOrder(orderId);

    // TODO: Notificar al sistema (posible integración con WebSocket, Queue, etc.)
    console.log(`[confirmOrder] Pedido ${orderId} confirmado. Estado: ${confirmedOrder.status}`);

    return NextResponse.json(confirmedOrder, { status: 200 });
  } catch (error) {
    console.error('[confirmOrder]', error);
    const msg = error instanceof Error ? error.message : String(error);
    
    if (msg.includes('no encontrado')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    if (msg.includes('No se puede confirmar')) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Error al confirmar el pedido' },
      { status: 500 }
    );
  }
}

// ─── US011: PUT /api/orders/[id]/status ───────────────────────────────────
/**
 * Actualizar el estado de un pedido
 * Estados válidos: PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED
 */
export async function updateOrderStatus(
  req: NextRequest,
  orderId: number
): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Se requiere el campo "status"' },
        { status: 400 }
      );
    }

    const updatedOrder = await dao.updateOrderStatus(orderId, status);
    
    console.log(`[updateOrderStatus] Pedido ${orderId} actualizado a estado: ${status}`);

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error('[updateOrderStatus]', error);
    const msg = error instanceof Error ? error.message : String(error);
    
    if (msg.includes('no encontrado')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    if (msg.includes('inválido') || msg.includes('No se puede')) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error al actualizar el estado del pedido' },
      { status: 500 }
    );
  }
}

// ─── GET /api/orders/[id] ────────────────────────────────────────────────
/**
 * Obtener una orden específica con sus detalles
 */
export async function getOrderById(
  _req: NextRequest,
  orderId: number
): Promise<NextResponse> {
  try {
    if (isNaN(orderId) || orderId <= 0) {
      return NextResponse.json(
        { error: 'ID de pedido inválido' },
        { status: 400 }
      );
    }

    const order = await dao.getOrderWithItems(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('[getOrderById]', error);
    return NextResponse.json(
      { error: 'Error al obtener el pedido' },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/orders/[id]/cancel ──────────────────────────────────────
/**
 * Cancelar un pedido
 */
export async function cancelOrder(
  req: NextRequest,
  orderId: number
): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}));
    const { reason } = body;

    const cancelledOrder = await dao.cancelOrder(orderId, reason);

    // Restaurar stock de productos si la orden fue descargada previamente
    await restoreStockForOrder(orderId);

    console.log(`[cancelOrder] Pedido ${orderId} cancelado. Razón: ${reason || 'No especificada'}`);

    return NextResponse.json(cancelledOrder, { status: 200 });
  } catch (error) {
    console.error('[cancelOrder]', error);
    const msg = error instanceof Error ? error.message : String(error);
    
    if (msg.includes('no encontrado')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    if (msg.includes('No se puede cancelar')) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error al cancelar el pedido' },
      { status: 500 }
    );
  }
}

// ─── Helper: Descontar stock de los productos en una orden ─────────────────
/**
 * Cuando se confirma un pedido, se descuentan automáticamente las cantidades
 * de stock de cada producto según lo registrado en order_items
 */
async function decreaseStockForOrder(orderId: number): Promise<void> {
  try {
    // Obtener los items de la orden
    const result = await db.query(
      `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    const items = result.rows;

    // Descontar el stock de cada producto
    for (const item of items) {
      await db.query(
        `UPDATE products 
         SET stock_quantity = GREATEST(stock_quantity - $1, 0),
             is_available = CASE WHEN (stock_quantity - $1) <= 0 THEN false ELSE is_available END,
             last_stock_update = NOW()
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );

      console.log(`[Stock] Producto ${item.product_id}: stock decremented by ${item.quantity}`);
    }
  } catch (error) {
    console.error('[decreaseStockForOrder] Error descargando stock:', error);
    // No lanzar excepción para no fallar toda la confirmación de la orden
  }
}

// ─── Helper: Restaurar stock de los productos en una orden cancelada ────────
/**
 * Cuando se cancela un pedido confirmado, se restauran automáticamente
 * las cantidades de stock de cada producto
 */
async function restoreStockForOrder(orderId: number): Promise<void> {
  try {
    // Obtener los items de la orden
    const result = await db.query(
      `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    const items = result.rows;

    // Restaurar el stock de cada producto
    for (const item of items) {
      await db.query(
        `UPDATE products 
         SET stock_quantity = stock_quantity + $1,
             is_available = true,
             last_stock_update = NOW()
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );

      console.log(`[Stock] Producto ${item.product_id}: stock restored by ${item.quantity}`);
    }
  } catch (error) {
    console.error('[restoreStockForOrder] Error restaurando stock:', error);
    // No lanzar excepción para no fallar toda la cancelación de la orden
  }
}
