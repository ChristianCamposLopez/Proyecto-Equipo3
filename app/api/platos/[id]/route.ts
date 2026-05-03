// app/api/platos/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { MenuService } from '@/services/MenuService';
import { db } from "@/config/db";

const menuController = new MenuService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }
    const product = await menuController.getProductById(productId);
    return NextResponse.json({ product });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const productId = Number(id);
    const body = await request.json();
    
    if (typeof body.isAvailable === 'boolean') {
      await db.query("UPDATE products SET is_available = $1 WHERE id = $2", [body.isAvailable, productId]);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}