import { NextRequest, NextResponse } from 'next/server';
import { ProductAvailabilityDAO } from '@/models/daos/ProductAvailabilityDAO';

type Context = {
  params: Promise<{ id: string }>;
};

const productAvailabilityDAO = new ProductAvailabilityDAO();

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }

    const body = await req.json();
    const stock = Number(body?.stock);

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { error: 'El stock debe ser un entero mayor o igual a cero' },
        { status: 400 }
      );
    }

    const updated = await productAvailabilityDAO.updateStock(productId, stock);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar stock';
    const status = message.includes('no encontrado') ? 404 : 500;

    console.error('[PATCH /api/products/[id]/stock]', error);
    return NextResponse.json({ error: message }, { status });
  }
}
