// app/api/platos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MenuController } from '../../../controllers/MenuController';

const menuController = new MenuController();

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

    const product = await menuController.createProduct({
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
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const result = await menuController.getCatalogProducts(
      restaurantId ? Number(restaurantId) : null,
      includeInactive
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