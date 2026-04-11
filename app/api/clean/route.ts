// app/api/clean/route.ts
// Endpoint para limpiar duplicados de la base de datos

import { NextResponse } from 'next/server';
import { db } from '@/config/db';

export async function POST() {
  try {
    console.log('🧹 Iniciando limpieza de duplicados...');

    // 1. Eliminar todos los productos duplicados, manteniendo solo el primero de cada nombre
    await db.query(`
      DELETE FROM products p1
      WHERE p1.id NOT IN (
        SELECT MIN(p2.id)
        FROM products p2
        GROUP BY LOWER(p2.name), p2.category_id
      )
    `);
    console.log('✓ Productos duplicados eliminados');

    // 2. Eliminar referencias huérfanas en order_items
    await db.query(`
      DELETE FROM order_items oi
      WHERE oi.product_id NOT IN (SELECT id FROM products)
    `);
    console.log('✓ Order items huérfanos eliminados');

    // 3. Reasignar productos de categorías duplicadas a la primera categoría del grupo
    await db.query(`
      UPDATE products p
      SET category_id = (
        SELECT MIN(c2.id)
        FROM categories c2
        WHERE LOWER(c2.name) = LOWER(c.name) AND c2.restaurant_id = c.restaurant_id
      )
      FROM categories c
      WHERE p.category_id = c.id
        AND c.id NOT IN (
          SELECT MIN(c2.id)
          FROM categories c2
          GROUP BY LOWER(c2.name), c2.restaurant_id
        )
    `);
    console.log('✓ Productos reasignados a categorías principales');

    // 4. Eliminar categorías duplicadas (ahora sin referencias)
    await db.query(`
      DELETE FROM categories c1
      WHERE c1.id NOT IN (
        SELECT MIN(c2.id)
        FROM categories c2
        GROUP BY LOWER(c2.name), c2.restaurant_id
      )
    `);
    console.log('✓ Categorías duplicadas eliminadas');

    // 4. Verificar estado final
    const productsCount = await db.query('SELECT COUNT(*) FROM products');
    const categoriesCount = await db.query('SELECT COUNT(*) FROM categories');
    const ordersCount = await db.query('SELECT COUNT(*) FROM orders');

    return NextResponse.json({
      success: true,
      message: '✅ Base de datos limpiada exitosamente',
      stats: {
        products: productsCount.rows[0].count,
        categories: categoriesCount.rows[0].count,
        orders: ordersCount.rows[0].count
      }
    });
  } catch (error) {
    console.error('[POST /api/clean]', error);
    return NextResponse.json(
      { error: 'Error al limpiar la base de datos', details: String(error) },
      { status: 500 }
    );
  }
}
