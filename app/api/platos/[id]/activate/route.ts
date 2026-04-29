// app/api/platos/[id]/activate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MenuController } from '@/controllers/MenuController';

const menuController = new MenuController();

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
    await menuController.activateProduct(productId);
    return NextResponse.json({ message: 'Producto activado exitosamente' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}