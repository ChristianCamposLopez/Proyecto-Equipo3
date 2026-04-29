// app/api/platos/[id]/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MenuController } from '@/controllers/MenuController';

const menuController = new MenuController();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    await menuController.eliminarProduct(productId);
    return NextResponse.json({ message: 'Producto eliminado lógicamente' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}