// app/api/platos/[id]/stock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/services/MenuService';

const menuController = new MenuService();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    const body = await request.json();
    const { stock } = body;
    await menuController.updateStock(productId, stock);
    return NextResponse.json({ message: 'Stock actualizado correctamente' });
  } catch (err: any) {
    console.error("DETALLE DEL ERROR:", err); //
    if (err.message === 'Producto no encontrado') {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err.message === 'El stock no puede ser negativo') {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}