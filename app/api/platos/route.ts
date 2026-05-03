// app/api/platos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/services/MenuService';

const menuService = new MenuService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, base_price, stock, category_id, descripcion } = body;

    if (!name || !base_price || stock === undefined || !category_id) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const product = await menuService.createProductoEntity({
      name,
      base_price: Number(base_price),
      stock: Number(stock),
      category_id: Number(category_id),
      descripcion: descripcion || null
    });

    return NextResponse.json({
      message: 'Plato creado exitosamente',
      product
    });
  } catch (err: any) {
    console.error('POST create product error', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const restaurantId = searchParams.get('restaurantId');
    const categoryId = searchParams.get('categoryId'); //NUEVO Para filtaredo de categorias USOO1 (Sprint 6)
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const result = await menuService.getCatalogProducts(
      restaurantId ? Number(restaurantId) : null,
      includeInactive,
      categoryId ? Number(categoryId) : null //NUEVO Para filtrado de categorias USOO1 (Sprint 6)
    );

    return NextResponse.json(result);

  } catch (err) {
    console.error('GET /api/platos error', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}