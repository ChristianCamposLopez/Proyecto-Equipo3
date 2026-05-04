// app/api/platos/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { MenuService } from '@/services/MenuService';
import { db } from "@/config/db";

const menuController = new MenuService();

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    const body = await request.json();
    
    if (typeof body.isAvailable === 'boolean') {
      // US008/US010: Al activar disponibilidad, debemos asegurar que el stock sea > 0 para cumplir la constraint
      if (body.isAvailable) {
        await db.query("UPDATE products SET is_available = true, stock = GREATEST(stock, 10) WHERE id = $1", [productId]);
      } else {
        await db.query("UPDATE products SET is_available = false, stock = 0 WHERE id = $1", [productId]);
      }
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}