// app/api/platos/[id]/desactivate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/services/MenuService';

const menuController = new MenuService();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    await menuController.deactivateProductoEntity(productId);
    return NextResponse.json({ message: 'Producto desactivado' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}