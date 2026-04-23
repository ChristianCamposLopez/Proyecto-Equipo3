import { NextResponse, NextRequest } from 'next/server';
import { MenuController } from '@/controllers/MenuController';

const menuController = new MenuController();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }
    const product = await menuController.getProductById(productId);
    return NextResponse.json({ product });
  } catch (err: any) {
    console.error(err);
    if (err.message === 'Producto no encontrado') {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }
    await menuController.deactivateProduct(productId);
    return NextResponse.json({ message: 'Producto desactivado exitosamente' });
  } catch (err: any) {
    if (err.message === 'Producto no encontrado') {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}