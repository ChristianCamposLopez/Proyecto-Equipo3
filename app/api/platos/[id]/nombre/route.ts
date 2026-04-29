// app/api/platos/[id]/nombre/route.ts
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
    const body = await request.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    const updated = await menuController.updateNombre(productId, name);
    return NextResponse.json({ message: 'Nombre actualizado', product: updated });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}