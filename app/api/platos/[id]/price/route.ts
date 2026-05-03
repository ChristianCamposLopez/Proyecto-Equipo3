// app/api/platos/[id]/price/route.ts
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
    const { price } = body;
    await menuController.updatePrice(productId, price);
    return NextResponse.json({ message: 'Precio actualizado correctamente' });
  } catch (err: any) {
    if (err.message === 'Producto no encontrado') {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err.message === 'El precio debe ser mayor a 0') {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}