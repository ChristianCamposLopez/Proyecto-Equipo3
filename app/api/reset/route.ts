// app/api/reset/route.ts
// Endpoint para resetear completamente la base de datos

import { NextResponse } from 'next/server';
import { db } from '@/config/db';

export async function POST() {
  try {
    console.log('🔄 Iniciando reset de base de datos...');

    // 1. Truncate todas las tablas (más efectivo que DELETE)
    const tables = [
      'order_items',
      'payments',
      'orders',
      'products',
      'categories',
      'restaurants',
      'users'
    ];

    for (const table of tables) {
      try {
        await db.query(`TRUNCATE TABLE ${table} CASCADE`);
      } catch (err) {
        console.log(`⚠ Error limpiando ${table}, continuando...`);
      }
    }
    console.log('✓ Todas las tablas truncadas');

    // Reset sequences to start from 1
    const sequences = ['users_id_seq', 'restaurants_id_seq', 'categories_id_seq', 'products_id_seq', 'orders_id_seq', 'order_items_id_seq', 'payments_id_seq'];
    for (const seq of sequences) {
      try {
        await db.query(`ALTER SEQUENCE ${seq} RESTART WITH 1`);
      } catch (err) {
        console.log(`⚠ Error reseteando secuencia ${seq}, continuando...`);
      }
    }
    console.log('✓ Secuencias reseteadas');

    // 2. Reinsertar datos
    const adminUser = await db.query(`
      INSERT INTO users (email, full_name, phone_number)
      VALUES ('admin@restaurante.com', 'Admin Restaurante', '5559876543')
      RETURNING id
    `);
    const adminUserId = adminUser.rows[0].id;

    const clientUser = await db.query(`
      INSERT INTO users (email, full_name, phone_number)
      VALUES ('cliente@ejemplo.com', 'Juan Cliente', '5551234567')
      RETURNING id
    `);
    const clientUserId = clientUser.rows[0].id;

    console.log('✓ Usuarios creados');

    // 3. Restaurante
    const restaurantResult = await db.query(`
      INSERT INTO restaurants (owner_user_id, name, latitude, longitude, is_active)
      VALUES ($1, 'La Parrilla Mixteca', 14.0833, -87.1921, true)
      RETURNING id
    `, [adminUserId]);
    const restaurantId = restaurantResult.rows[0].id;
    console.log('✓ Restaurante creado');

    // 4. Categorías (exactamente 7)
    const categoriesResult = await db.query(`
      INSERT INTO categories (restaurant_id, name, descripcion)
      VALUES 
        ($1, 'Hamburguesas', 'Hamburguesas gourmet'),
        ($1, 'Tacos', 'Tacos mexicanos auténticos'),
        ($1, 'Pizzas', 'Pizzas al horno'),
        ($1, 'Comidas Principales', 'Platos fuertes'),
        ($1, 'Bebidas', 'Bebidas variadas'),
        ($1, 'Postres', 'Postres deliciosos'),
        ($1, 'Ensaladas', 'Ensaladas frescas')
      RETURNING id, name
    `, [restaurantId]);
    console.log('✓ Categorías creadas (7)');

    const categoryMap: Record<string, number> = {};
    for (const cat of categoriesResult.rows) {
      categoryMap[cat.name] = cat.id;
    }

    // 5. Productos (exactamente 35)
    const hamburguesas = categoryMap['Hamburguesas'];
    const tacos = categoryMap['Tacos'];
    const pizzas = categoryMap['Pizzas'];
    const principales = categoryMap['Comidas Principales'];
    const bebidas = categoryMap['Bebidas'];
    const postres = categoryMap['Postres'];
    const ensaladas = categoryMap['Ensaladas'];

    await db.query(`
      INSERT INTO products (category_id, name, base_price, is_available, stock_quantity, low_stock_threshold)
      VALUES 
        ($1, 'Hamburguesa Mojarra', 85.00, true, 50, 5),
        ($1, 'Hamburguesa Mixta', 90.00, true, 45, 5),
        ($1, 'Hamburguesa Vegana', 75.00, false, 20, 5),
        ($1, 'Hamburguesa Clásica', 65.00, true, 60, 5),
        ($1, 'Hamburguesa Gigante', 110.00, true, 30, 5),
        ($2, 'Tacos al Pastor', 45.00, true, 100, 10),
        ($2, 'Tacos de Pollo', 40.00, false, 50, 10),
        ($2, 'Tacos de Camarones', 55.00, true, 35, 10),
        ($2, 'Tacos de Carne Asada', 50.00, true, 70, 10),
        ($2, 'Tacos Dorados', 35.00, true, 80, 10),
        ($3, 'Pizza Hawaiana', 95.00, true, 40, 5),
        ($3, 'Pizza Pepperoni', 85.00, true, 50, 5),
        ($3, 'Pizza Vegetariana', 80.00, true, 45, 5),
        ($3, 'Pizza Carnívora', 105.00, false, 25, 5),
        ($3, 'Pizza Cuatro Quesos', 100.00, true, 55, 5),
        ($4, 'Filete a la Pimienta', 150.00, true, 25, 3),
        ($4, 'Pechuga de Pollo Rellena', 125.00, true, 30, 3),
        ($4, 'Salmón a la Mantequilla', 160.00, false, 15, 3),
        ($4, 'Costillas BBQ', 140.00, true, 20, 3),
        ($4, 'Pasta Alfredo', 95.00, true, 35, 3),
        ($5, 'Refrescos Variados', 20.00, true, 200, 20),
        ($5, 'Agua Natural', 15.00, true, 250, 30),
        ($5, 'Jugo Natural', 35.00, true, 150, 15),
        ($5, 'Cerveza Nacional', 40.00, true, 100, 10),
        ($5, 'Vino Tinto', 65.00, false, 40, 5),
        ($6, 'Flan Mexicano', 45.00, true, 60, 5),
        ($6, 'Pastel de Chocolate', 55.00, true, 50, 5),
        ($6, 'Helado Artesanal', 35.00, true, 80, 10),
        ($6, 'Tiramisú', 50.00, false, 30, 5),
        ($6, 'Churros con Chocolate', 30.00, true, 120, 10),
        ($7, 'Ensalada César', 55.00, true, 40, 5),
        ($7, 'Ensalada Griega', 60.00, true, 35, 5),
        ($7, 'Ensalada Mixta', 45.00, true, 50, 5),
        ($7, 'Ensalada de Pollo', 70.00, false, 25, 5),
        ($7, 'Ensalada Caprese', 65.00, true, 45, 5)
    `, [hamburguesas, tacos, pizzas, principales, bebidas, postres, ensaladas]);
    console.log('✓ Productos creados (35)');

    // 6. Insertar órdenes de demostración
    const ordersResult = await db.query(`
      INSERT INTO orders (customer_id, restaurant_id, status, total_amount, created_at)
      VALUES 
        ($1, $2, 'COMPLETED', 150.00, NOW() - INTERVAL '3 days'),
        ($1, $2, 'COMPLETED', 135.00, NOW() - INTERVAL '3 days'),
        ($1, $2, 'COMPLETED', 235.00, NOW() - INTERVAL '2 days'),
        ($1, $2, 'PENDING', 125.00, NOW()),
        ($1, $2, 'CONFIRMED', 95.00, NOW()),
        ($1, $2, 'READY', 145.00, NOW())
      RETURNING id
    `, [clientUserId, restaurantId]);
    const ordersCount = ordersResult.rows.length;
    console.log(`✓ Órdenes de demostración creadas (${ordersCount})`);

    return NextResponse.json({
      success: true,
      message: '✅ Base de datos reseteada exitosamente',
      stats: {
        users: 2,
        categories: 7,
        products: 35,
        orders: ordersCount,
        order_items: 0
      }
    });
  } catch (error) {
    console.error('[POST /api/reset]', error);
    return NextResponse.json(
      { error: 'Error al resetear la base de datos', details: String(error) },
      { status: 500 }
    );
  }
}
