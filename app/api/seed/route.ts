import { NextResponse } from 'next/server';
import { db } from '@/config/db';

export async function POST() {
  try {
    console.log('Iniciando inserción de datos de prueba...');

    // 1. Insertar usuario (si no existe)
    const userResult = await db.query(
      `SELECT id FROM users WHERE email = 'admin@restaurante.com' LIMIT 1`
    );
    let adminUserId = 2;
    if (userResult.rows.length === 0) {
      const newUser = await db.query(`
        INSERT INTO users (email, password_hash, full_name, phone_number)
        VALUES ('admin@restaurante.com', 'dummy_hash', 'Admin Restaurante', '5559876543')
        RETURNING id
      `);
      adminUserId = newUser.rows[0].id;
    } else {
      adminUserId = userResult.rows[0].id;
    }
    // Asignar rol restaurant_admin (ID 2)
    await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, 2) ON CONFLICT DO NOTHING', [adminUserId]);

    // 1.1 Insertar Chef
    const chefResult = await db.query("SELECT id FROM users WHERE email = 'chef@restaurante.com' LIMIT 1");
    let chefUserId;
    if (chefResult.rows.length === 0) {
      const newChef = await db.query(`
        INSERT INTO users (email, password_hash, full_name, phone_number)
        VALUES ('chef@restaurante.com', 'dummy_hash', 'Chef Master', '5551112222')
        RETURNING id
      `);
      chefUserId = newChef.rows[0].id;
    } else {
      chefUserId = chefResult.rows[0].id;
    }
    await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, 3) ON CONFLICT DO NOTHING', [chefUserId]);

    // 1.2 Insertar Repartidor
    const deliveryResult = await db.query("SELECT id FROM users WHERE email = 'repartidor@restaurante.com' LIMIT 1");
    let deliveryUserId;
    if (deliveryResult.rows.length === 0) {
      const newDelivery = await db.query(`
        INSERT INTO users (email, password_hash, full_name, phone_number)
        VALUES ('repartidor@restaurante.com', 'dummy_hash', 'Juan Repartidor', '5553334444')
        RETURNING id
      `);
      deliveryUserId = newDelivery.rows[0].id;
    } else {
      deliveryUserId = deliveryResult.rows[0].id;
    }
    await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, 4) ON CONFLICT DO NOTHING', [deliveryUserId]);

    console.log('✓ Usuarios y roles insertados/verificados');

    // 2. Insertar restaurante
    await db.query(`
      INSERT INTO restaurants (owner_user_id, name, latitude, longitude, is_active)
      VALUES ($1, 'La Parrilla Mixteca', 14.0833, -87.1921, true)
      ON CONFLICT DO NOTHING
    `, [adminUserId]);
    console.log('✓ Restaurante insertado');

    // 3. Insertar categorías
    const categoriesResult = await db.query(`
      INSERT INTO categories (restaurant_id, name, descripcion)
      VALUES 
        (1, 'Hamburguesas', 'Hamburguesas gourmet'),
        (1, 'Tacos', 'Tacos mexicanos auténticos'),
        (1, 'Pizzas', 'Pizzas al horno'),
        (1, 'Comidas Principales', 'Platos fuertes'),
        (1, 'Bebidas', 'Bebidas variadas'),
        (1, 'Postres', 'Postres deliciosos'),
        (1, 'Ensaladas', 'Ensaladas frescas')
      RETURNING id, name
    `);
    console.log('✓ Categorías insertadas (7)');

    // Crear un mapa de categoría -> id
    const categoryMap: Record<string, number> = {};
    for (const cat of categoriesResult.rows) {
      categoryMap[cat.name] = cat.id;
    }

    // 4. Insertar productos usando los IDs correctos
    const hamburguesas = categoryMap['Hamburguesas'];
    const tacos = categoryMap['Tacos'];
    const pizzas = categoryMap['Pizzas'];
    const principales = categoryMap['Comidas Principales'];
    const bebidas = categoryMap['Bebidas'];
    const postres = categoryMap['Postres'];
    const ensaladas = categoryMap['Ensaladas'];

    await db.query(`
      INSERT INTO products (category_id, name, base_price, is_available, stock)
      VALUES 
        ($1, 'Hamburguesa Mojarra', 85.00, true, 10),
        ($1, 'Hamburguesa Mixta', 90.00, true, 10),
        ($1, 'Hamburguesa Vegana', 75.00, false, 0),
        ($1, 'Hamburguesa Clásica', 65.00, true, 10),
        ($1, 'Hamburguesa Gigante', 110.00, true, 10),
        ($2, 'Tacos al Pastor', 45.00, true, 10),
        ($2, 'Tacos de Pollo', 40.00, false, 0),
        ($2, 'Tacos de Camarones', 55.00, true, 10),
        ($2, 'Tacos de Carne Asada', 50.00, true, 10),
        ($2, 'Tacos Dorados', 35.00, true, 10),
        ($3, 'Pizza Hawaiana', 95.00, true, 10),
        ($3, 'Pizza Pepperoni', 85.00, true, 10),
        ($3, 'Pizza Vegetariana', 80.00, true, 10),
        ($3, 'Pizza Carnívora', 105.00, false, 0),
        ($3, 'Pizza Cuatro Quesos', 100.00, true, 10),
        ($4, 'Filete a la Pimienta', 150.00, true, 10),
        ($4, 'Pechuga de Pollo Rellena', 125.00, true, 10),
        ($4, 'Salmón a la Mantequilla', 160.00, false, 0),
        ($4, 'Costillas BBQ', 140.00, true, 10),
        ($4, 'Pasta Alfredo', 95.00, true, 10),
        ($5, 'Refrescos Variados', 20.00, true, 10),
        ($5, 'Agua Natural', 15.00, true, 10),
        ($5, 'Jugo Natural', 35.00, true, 10),
        ($5, 'Cerveza Nacional', 40.00, true, 10),
        ($5, 'Vino Tinto', 65.00, false, 0),
        ($6, 'Flan Mexicano', 45.00, true, 10),
        ($6, 'Pastel de Chocolate', 55.00, true, 10),
        ($6, 'Helado Artesanal', 35.00, true, 10),
        ($6, 'Tiramisú', 50.00, false, 0),
        ($6, 'Churros con Chocolate', 30.00, true, 10),
        ($7, 'Ensalada César', 55.00, true, 10),
        ($7, 'Ensalada Griega', 60.00, true, 10),
        ($7, 'Ensalada Mixta', 45.00, true, 10),
        ($7, 'Ensalada de Pollo', 70.00, false, 0),
        ($7, 'Ensalada Caprese', 65.00, true, 10)
      ON CONFLICT DO NOTHING
    `, [hamburguesas, tacos, pizzas, principales, bebidas, postres, ensaladas]);
    console.log('✓ Productos insertados (35)');

    // 5. Insertar usuario cliente
    const clientResult = await db.query(
      `SELECT id FROM users WHERE email = 'cliente@ejemplo.com' LIMIT 1`
    );
    let clientUserId = 1;
    if (clientResult.rows.length === 0) {
      const newClient = await db.query(`
        INSERT INTO users (email, password_hash, full_name, phone_number)
        VALUES ('cliente@ejemplo.com', 'dummy_hash', 'Juan Cliente', '5551234567')
        RETURNING id
      `);
      clientUserId = newClient.rows[0].id;
    } else {
      clientUserId = clientResult.rows[0].id;
    }
    // Asignar rol client (ID 1)
    await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, 1) ON CONFLICT DO NOTHING', [clientUserId]);

    // Obtener todos los productos para mapear sus IDs
    const productsResult = await db.query(`
      SELECT id, name FROM products ORDER BY id
    `);
    const productMap: Record<string, number> = {};
    for (const prod of productsResult.rows) {
      productMap[prod.name] = prod.id;
    }

    // 6. Insertar órdenes
    const ordersResult = await db.query(`
      INSERT INTO orders (customer_id, restaurant_id, status, total_amount, created_at)
      VALUES 
        ($1, 1, 'COMPLETED', 150.00, NOW() - INTERVAL '3 days'),
        ($1, 1, 'COMPLETED', 135.00, NOW() - INTERVAL '3 days'),
        ($1, 1, 'COMPLETED', 235.00, NOW() - INTERVAL '2 days'),
        ($1, 1, 'COMPLETED', 245.00, NOW() - INTERVAL '2 days'),
        ($1, 1, 'COMPLETED', 150.00, NOW() - INTERVAL '1 day'),
        ($1, 1, 'COMPLETED', 185.00, NOW() - INTERVAL '1 day'),
        ($1, 1, 'COMPLETED', 230.00, NOW() - INTERVAL '1 day'),
        ($1, 1, 'COMPLETED', 280.00, NOW() - INTERVAL '1 day'),
        ($1, 1, 'PENDING', 125.00, NOW()),
        ($1, 1, 'CONFIRMED', 95.00, NOW()),
        ($1, 1, 'CONFIRMED', 165.00, NOW()),
        ($1, 1, 'READY', 145.00, NOW())
      RETURNING id
    `, [clientUserId]);
    console.log('✓ Órdenes insertadas (12)');

    // Extraer los IDs de las órdenes
    const orderIds = ordersResult.rows.map(r => r.id);

    // 7. Insertar order items usando los IDs correctos de productos y órdenes
    const ids = {
      hamburguesa_mojarra: productMap['Hamburguesa Mojarra'],
      tacos_pastor: productMap['Tacos al Pastor'],
      refrescos: productMap['Refrescos Variados'],
      hamburguesa_clasica: productMap['Hamburguesa Clásica'],
      tacos_pollo: productMap['Tacos de Pollo'],
      pizza_hawaiana: productMap['Pizza Hawaiana'],
      helado: productMap['Helado Artesanal'],
      hamburguesa_gigante: productMap['Hamburguesa Gigante'],
      pizza_pepperoni: productMap['Pizza Pepperoni'],
      pizza_4quesos: productMap['Pizza Cuatro Quesos'],
      tacos_camarones: productMap['Tacos de Camarones'],
      pasta_alfredo: productMap['Pasta Alfredo'],
      ensalada_cesar: productMap['Ensalada César'],
      filete: productMap['Filete a la Pimienta'],
      costillas: productMap['Costillas BBQ'],
      churros: productMap['Churros con Chocolate']
    };

    // Construir valores dinámicamente usando los IDs reales de órdenes
    const itemValues = [
      `(${orderIds[0]}, ${ids.hamburguesa_mojarra}, 1, 85.00)`,
      `(${orderIds[0]}, ${ids.tacos_pastor}, 1, 45.00)`,
      `(${orderIds[0]}, ${ids.refrescos}, 2, 20.00)`,
      `(${orderIds[1]}, ${ids.hamburguesa_clasica}, 2, 65.00)`,
      `(${orderIds[1]}, ${ids.tacos_camarones}, 1, 55.00)`,
      `(${orderIds[2]}, ${ids.pizza_hawaiana}, 3, 95.00)`,
      `(${orderIds[2]}, ${ids.helado}, 2, 35.00)`,
      `(${orderIds[3]}, ${ids.hamburguesa_gigante}, 1, 100.00)`,
      `(${orderIds[3]}, ${ids.ensalada_cesar}, 1, 55.00)`,
      `(${orderIds[4]}, ${ids.hamburguesa_mojarra}, 1, 85.00)`,
      `(${orderIds[4]}, ${ids.tacos_pastor}, 1, 45.00)`,
      `(${orderIds[4]}, ${ids.refrescos}, 1, 20.00)`,
      `(${orderIds[5]}, ${ids.pizza_pepperoni}, 1, 85.00)`,
      `(${orderIds[5]}, ${ids.costillas}, 1, 140.00)`,
      `(${orderIds[5]}, ${ids.helado}, 2, 35.00)`,
      `(${orderIds[6]}, ${ids.tacos_camarones}, 2, 55.00)`,
      `(${orderIds[6]}, ${ids.refrescos}, 2, 20.00)`,
      `(${orderIds[6]}, ${ids.helado}, 1, 35.00)`,
      `(${orderIds[7]}, ${ids.pizza_hawaiana}, 4, 95.00)`,
      `(${orderIds[7]}, ${ids.helado}, 2, 35.00)`,
      `(${orderIds[8]}, ${ids.hamburguesa_mojarra}, 1, 85.00)`,
      `(${orderIds[8]}, ${ids.refrescos}, 2, 20.00)`,
      `(${orderIds[9]}, ${ids.pizza_hawaiana}, 2, 95.00)`,
      `(${orderIds[9]}, ${ids.helado}, 1, 35.00)`,
      `(${orderIds[10]}, ${ids.pizza_pepperoni}, 1, 85.00)`,
      `(${orderIds[10]}, ${ids.costillas}, 1, 140.00)`,
      `(${orderIds[11]}, ${ids.tacos_camarones}, 1, 55.00)`,
      `(${orderIds[11]}, ${ids.helado}, 1, 35.00)`
    ];

    await db.query(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase)
      VALUES ${itemValues.join(', ')}
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Items de órdenes insertados (28)');

    // 8. Insertar pagos usando IDs reales de órdenes
    const paymentValues = [
      `(${orderIds[0]}, 'CARD', 'SUCCESS', 'TXN1001', NOW() - INTERVAL '3 days')`,
      `(${orderIds[1]}, 'CASH', 'SUCCESS', NULL, NOW() - INTERVAL '3 days')`,
      `(${orderIds[2]}, 'CARD', 'SUCCESS', 'TXN1003', NOW() - INTERVAL '2 days')`,
      `(${orderIds[3]}, 'CARD', 'SUCCESS', 'TXN1004', NOW() - INTERVAL '2 days')`,
      `(${orderIds[4]}, 'CASH', 'SUCCESS', NULL, NOW() - INTERVAL '1 day')`,
      `(${orderIds[5]}, 'CARD', 'SUCCESS', 'TXN1006', NOW() - INTERVAL '1 day')`,
      `(${orderIds[6]}, 'CARD', 'SUCCESS', 'TXN1007', NOW() - INTERVAL '1 day')`,
      `(${orderIds[7]}, 'CASH', 'SUCCESS', NULL, NOW() - INTERVAL '1 day')`,
      `(${orderIds[8]}, 'CARD', 'PENDING', 'TXN1009', NOW())`,
      `(${orderIds[9]}, 'CARD', 'PENDING', 'TXN1010', NOW())`,
      `(${orderIds[10]}, 'CASH', 'PENDING', NULL, NOW())`,
      `(${orderIds[11]}, 'CARD', 'PENDING', 'TXN1012', NOW())`
    ];

    await db.query(`
      INSERT INTO payments (order_id, payment_method, status, transaction_id, created_at)
      VALUES ${paymentValues.join(', ')}
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Pagos insertados (12)');

    // 9. Insertar reembolsos usando IDs reales de pagos (opcional - tabla podría no existir)
    try {
      const paymentsResult = await db.query(`
        SELECT id, order_id FROM payments 
        WHERE order_id = ANY($1::int[])
        ORDER BY order_id
      `, [[orderIds[2], orderIds[3], orderIds[4], orderIds[5], orderIds[6]]]);

      const paymentMap: Record<number, number> = {};
      for (const p of paymentsResult.rows) {
        paymentMap[p.order_id] = p.id;
      }

      const refundValues = [
        `(${paymentMap[orderIds[2]]}, 235.00, 'Cliente solicitó cancelación', NOW() - INTERVAL '1 day')`,
        `(${paymentMap[orderIds[3]]}, 245.00, 'Producto defectuoso', NOW() - INTERVAL '12 hours')`,
        `(${paymentMap[orderIds[4]]}, 150.00, 'Error de orden', NOW() - INTERVAL '6 hours')`,
        `(${paymentMap[orderIds[5]]}, 185.00, 'Cliente no satisfecho', NOW() - INTERVAL '2 hours')`,
        `(${paymentMap[orderIds[6]]}, 230.00, 'Cancelación general', NOW() - INTERVAL '1 hour')`
      ];

      await db.query(`
        INSERT INTO refunds (payment_id, amount, reason, created_at)
        VALUES ${refundValues.join(', ')}
        ON CONFLICT DO NOTHING
      `);
      console.log('✓ Reembolsos insertados (5)');
    } catch (refundError) {
      console.log('⚠ Reembolsos omitidos (tabla podría no existir)');
    }

    return NextResponse.json({
      success: true,
      message: '✅ ¡Datos de prueba insertados exitosamente!',
      summary: {
        usuarios: 2,
        restaurantes: 1,
        categorias: 7,
        productos: 35,
        ordenes: 12,
        orderItems: 28,
        pagos: 12,
        reembolsos: 5
      }
    });

  } catch (error) {
    console.error('❌ Error insertando datos:', error);
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}
