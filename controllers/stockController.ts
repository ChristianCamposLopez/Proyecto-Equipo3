// controllers/stockController.ts
import { NextRequest, NextResponse } from 'next/server';
import { StockDAO } from '@/models/daos/StockDAO';

const dao = new StockDAO();

// ─── US008: POST /api/products/[id]/stock/update ─────────────────────────
/**
 * Actualizar el stock de un producto
 * Automáticamente marca como agotado si stock = 0
 */
export async function updateProductStock(
  req: NextRequest,
  productId: number
): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { quantity, reason } = body;

    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: 'Se requiere el campo "quantity"' },
        { status: 400 }
      );
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'quantity debe ser un número no negativo' },
        { status: 400 }
      );
    }

    const updated = await dao.updateStock(productId, quantity, reason);

    // Notificación según disponibilidad
    if (updated.stock_quantity === 0) {
      console.log(`[Stock] Producto ${productId} (${updated.name}) está AGOTADO`);
    } else if (updated.stock_quantity <= updated.low_stock_threshold) {
      console.log(`[Stock] Producto ${productId} (${updated.name}) STOCK BAJO: ${updated.stock_quantity}`);
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[updateProductStock]', error);
    const msg = error instanceof Error ? error.message : String(error);
    
    if (msg.includes('no encontrado')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    if (msg.includes('negativa')) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error al actualizar el stock' },
      { status: 500 }
    );
  }
}

// ─── US008: POST /api/products/[id]/stock/add ────────────────────────────
/**
 * Agregar stock (reabastecimiento)
 * Marca automáticamente como disponible
 */
export async function addProductStock(
  req: NextRequest,
  productId: number
): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { quantity } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'quantity debe ser un número mayor a 0' },
        { status: 400 }
      );
    }

    const updated = await dao.addStock(productId, quantity);
    console.log(`[Stock] Agregado ${quantity} unidades a producto ${productId}`);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[addProductStock]', error);
    const msg = error instanceof Error ? error.message : String(error);
    
    if (msg.includes('no encontrado')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al agregar stock' },
      { status: 500 }
    );
  }
}

// ─── US008: POST /api/products/[id]/stock/decrease ───────────────────────
/**
 * Descontar stock (cuando se vende un producto)
 * Marca como agotado si llega a 0
 */
export async function decreaseProductStock(
  req: NextRequest,
  productId: number
): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { quantity } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'quantity debe ser un número mayor a 0' },
        { status: 400 }
      );
    }

    const updated = await dao.decreaseStock(productId, quantity);
    console.log(`[Stock] Descontado ${quantity} unidades de producto ${productId}`);

    if (updated.stock_quantity === 0) {
      console.log(`[Stock] ALERTA: Producto ${productId} está AGOTADO`);
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[decreaseProductStock]', error);
    const msg = error instanceof Error ? error.message : String(error);
    
    if (msg.includes('no encontrado')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al descontar stock' },
      { status: 500 }
    );
  }
}

// ─── US008: POST /api/products/[id]/out-of-stock ──────────────────────────
/**
 * Marcar un producto como agotado inmediatamente
 */
export async function markOutOfStock(
  req: NextRequest,
  productId: number
): Promise<NextResponse> {
  try {
    const updated = await dao.markOutOfStock(productId);
    console.log(`[Stock] Producto ${productId} marcado como AGOTADO`);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[markOutOfStock]', error);
    const msg = error instanceof Error ? error.message : String(error);
    
    if (msg.includes('no encontrado')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al marcar como agotado' },
      { status: 500 }
    );
  }
}

// ─── US008: POST /api/products/[id]/restore ──────────────────────────────
/**
 * Restaurar un producto agotado
 */
export async function restoreProductAvailability(
  req: NextRequest,
  productId: number
): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { initialStock = 10 } = body;

    if (initialStock <= 0) {
      return NextResponse.json(
        { error: 'initialStock debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const updated = await dao.markAvailable(productId, initialStock);
    console.log(`[Stock] Producto ${productId} restaurado con ${initialStock} unidades`);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[restoreProductAvailability]', error);
    const msg = error instanceof Error ? error.message : String(error);
    
    if (msg.includes('no encontrado')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error al restaurar el producto' },
      { status: 500 }
    );
  }
}

// ─── GET /api/products/stock/alerts ──────────────────────────────────────
/**
 * Obtener alertas de stock bajo
 */
export async function getStockAlerts(
  _req: NextRequest,
  restaurantId: number
): Promise<NextResponse> {
  try {
    const alerts = await dao.getLowStockAlerts(restaurantId);
    return NextResponse.json(alerts, { status: 200 });
  } catch (error) {
    console.error('[getStockAlerts]', error);
    return NextResponse.json(
      { error: 'Error al obtener alertas de stock' },
      { status: 500 }
    );
  }
}

// ─── GET /api/products/stock/summary ─────────────────────────────────────
/**
 * Obtener resumen de stock
 */
export async function getStockSummary(
  _req: NextRequest,
  restaurantId: number
): Promise<NextResponse> {
  try {
    const summary = await dao.getStockSummary(restaurantId);
    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error('[getStockSummary]', error);
    return NextResponse.json(
      { error: 'Error al obtener resumen de stock' },
      { status: 500 }
    );
  }
}
