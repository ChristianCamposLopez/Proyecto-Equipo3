// app/api/platos/route.ts
import { db } from '../../../config/db';
import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '../../../lib/product.service';

const productService = new ProductService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      base_price,
      stock,
      category_id,
      descripcion
    } = body;

    // Validaciones básicas
    if (!name || !base_price || stock === undefined || !category_id) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const product = await productService.createProduct({
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
    const includeInactive = searchParams.get('includeInactive');

    const q = `
      SELECT
        p.id,
        p.name,
        p.base_price,
        p.is_active,
        COALESCE(
          (
            SELECT pi.image_path
            FROM product_images pi
            WHERE pi.product_id = p.id
              AND pi.is_primary = TRUE
              AND pi.deleted_at IS NULL
            LIMIT 1
          ),
          '/images/default-product.png'
        ) AS image_display
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE
        p.deleted_at IS NULL
        AND p.is_available = TRUE
        AND (
          $2::boolean = TRUE
          OR p.is_active = TRUE
        )
        AND ($1::int IS NULL OR c.restaurant_id = $1)
      ORDER BY p.id
    `;

    const result = await db.query(q, [
      restaurantId ? Number(restaurantId) : null,
      includeInactive === 'true'
    ]);

    return NextResponse.json({
      products: result.rows,
    });

  } catch (err) {

    console.error('GET /api/platos error', err);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );

  }
}

/*
Ya está diseñado para:

✅ Listar productos
✅ Filtrar por restaurante
✅ Incluir imagen
✅ Manejar activos/inactivos

👉 Es un endpoint de catálogo de productos, no de disponibilidad.
 */