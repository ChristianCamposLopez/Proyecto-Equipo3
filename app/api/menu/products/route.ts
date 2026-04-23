// app/api/menu/products/route.ts
// Devuelve todos los productos con su imagen y categoría
// Usado por: /menu (cliente) y /admin/productos/imagenes (admin)

import { NextResponse } from 'next/server';
import { db } from '@/config/db';

export async function GET() {
  try {
    const result = await db.query(`
      SELECT
        p.id,
        p.name,
        p.base_price,
        p.stock,
        p.is_available,
        p.image_url,
        COALESCE(p.stock_quantity, 0)::int AS stock_quantity,
        COALESCE(p.low_stock_threshold, 5)::int AS low_stock_threshold,
        c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY c.name, p.name
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[GET /api/menu/products]', error);
    return NextResponse.json({ error: 'Error al obtener platillos' }, { status: 500 });
  }
}
