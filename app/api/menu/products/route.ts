// app/api/menu/products/route.ts
// Devuelve todos los productos con su imagen y categoría
// US020: Filtrado por disponibilidad horaria según hora del sistema

import { NextResponse } from 'next/server';
import { db } from '@/config/db';

export async function GET() {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Domingo
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // US020: Solo mostrar productos que estén disponibles según su horario
    // Productos sin horario asignado = siempre visibles
    const result = await db.query(`
      SELECT
        p.id,
        p.name,
        p.base_price,
        p.is_available,
        p.image_url,
        c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_available = TRUE
        AND (
          NOT EXISTS (SELECT 1 FROM product_schedules ps WHERE ps.product_id = p.id)
          OR EXISTS (
            SELECT 1 FROM product_schedules ps
            WHERE ps.product_id = p.id
              AND ps.day_of_week = $1
              AND ps.start_time <= $2::time
              AND ps.end_time >= $2::time
          )
        )
      ORDER BY c.name, p.name
    `, [dayOfWeek, currentTime]);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[GET /api/menu/products]', error);
    return NextResponse.json({ error: 'Error al obtener platillos' }, { status: 500 });
  }
}