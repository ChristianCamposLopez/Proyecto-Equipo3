// Script para insertar datos de prueba en la base de datos
import { db } from '@/config/db';

const seedTestData = async () => {
  try {
    console.log('Iniciando inserción de datos de prueba...');

    // 1. Insertar restaurante
    await db.query(`
      INSERT INTO restaurants (name, address, phone)
      VALUES ('La Parrilla Mixteca', 'Calle Principal 123', '+1234567890')
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Restaurante insertado');

    // 2. Insertar mesas
    await db.query(`
      INSERT INTO tables (restaurant_id, number)
      VALUES 
        (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
        (1, 6), (1, 7), (1, 8), (1, 9), (1, 10)
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Mesas insertadas');

    // 3. Insertar categorías
    await db.query(`
      INSERT INTO categories (restaurant_id, name, description)
      VALUES 
        (1, 'Hamburguesas', 'Hamburguesas gourmet'),
        (1, 'Tacos', 'Tacos mexicanos auténticos'),
        (1, 'Pizzas', 'Pizzas al horno'),
        (1, 'Comidas Principales', 'Platos fuertes'),
        (1, 'Bebidas', 'Bebidas variadas'),
        (1, 'Postres', 'Postres deliciosos'),
        (1, 'Ensaladas', 'Ensaladas frescas')
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Categorías insertadas');

    // 4. Insertar productos - Hamburguesas
    await db.query(`
      INSERT INTO products (restaurant_id, category_id, name, description, base_price, stock_quantity, low_stock_threshold, is_available)
      VALUES 
        (1, 1, 'Hamburguesa Mojarra', 'Carne angus con queso derretido', 85.00, 50, 5, true),
        (1, 1, 'Hamburguesa Mixta', 'Carne, pollo y queso', 90.00, 2, 5, true),
        (1, 1, 'Hamburguesa Vegana', 'Proteína vegetal premium', 75.00, 0, 5, false),
        (1, 1, 'Hamburguesa Clásica', 'Hamburguesa simple jugosa', 65.00, 20, 5, true),
        (1, 1, 'Hamburguesa Gigante', 'Doble carne, triple queso', 110.00, 8, 5, true)
      ON CONFLICT DO NOTHING
    `);

    // Tacos
    await db.query(`
      INSERT INTO products (restaurant_id, category_id, name, description, base_price, stock_quantity, low_stock_threshold, is_available)
      VALUES 
        (1, 2, 'Tacos al Pastor', 'Carne marinada con piña', 45.00, 35, 5, true),
        (1, 2, 'Tacos de Pollo', 'Pollo asado marinado', 40.00, 0, 5, false),
        (1, 2, 'Tacos de Camarones', 'Camarones empanizados', 55.00, 15, 5, true),
        (1, 2, 'Tacos de Carne Asada', 'Carne asada premium', 50.00, 25, 5, true),
        (1, 2, 'Tacos Dorados', 'Tacos crujientes de papa', 35.00, 43, 5, true)
      ON CONFLICT DO NOTHING
    `);

    // Pizzas
    await db.query(`
      INSERT INTO products (restaurant_id, category_id, name, description, base_price, stock_quantity, low_stock_threshold, is_available)
      VALUES 
        (1, 3, 'Pizza Hawaiana', 'Jamón, piña y queso', 95.00, 12, 5, true),
        (1, 3, 'Pizza Pepperoni', 'Pepperoni, queso y tomate', 85.00, 3, 5, true),
        (1, 3, 'Pizza Vegetariana', 'Verduras frescas varias', 80.00, 6, 5, true),
        (1, 3, 'Pizza Carnívora', 'Carnes varias y queso', 105.00, 0, 5, false),
        (1, 3, 'Pizza Cuatro Quesos', 'Mezcla de quesos premium', 100.00, 18, 5, true)
      ON CONFLICT DO NOTHING
    `);

    // Comidas Principales
    await db.query(`
      INSERT INTO products (restaurant_id, category_id, name, description, base_price, stock_quantity, low_stock_threshold, is_available)
      VALUES 
        (1, 4, 'Filete a la Pimienta', 'Filete con salsa de pimienta', 150.00, 9, 5, true),
        (1, 4, 'Pechuga de Pollo Rellena', 'Pechuga rellena de queso', 125.00, 1, 5, true),
        (1, 4, 'Salmón a la Mantequilla', 'Salmón fresco cocinado', 160.00, 0, 5, false),
        (1, 4, 'Costillas BBQ', 'Costillas ahumadas con BBQ', 140.00, 14, 5, true),
        (1, 4, 'Pasta Alfredo', 'Pasta con salsa Alfredo', 95.00, 21, 5, true)
      ON CONFLICT DO NOTHING
    `);

    // Bebidas
    await db.query(`
      INSERT INTO products (restaurant_id, category_id, name, description, base_price, stock_quantity, low_stock_threshold, is_available)
      VALUES 
        (1, 5, 'Refrescos Variados', 'Coca, Sprite, etc', 20.00, 100, 10, true),
        (1, 5, 'Agua Natural', 'Botella de 500ml', 15.00, 150, 10, true),
        (1, 5, 'Jugo Natural', 'Naranja, limón, mango', 35.00, 45, 10, true),
        (1, 5, 'Cerveza Nacional', 'Cerveza 350ml', 40.00, 60, 15, true),
        (1, 5, 'Vino Tinto', 'Copa de vino tinto', 65.00, 0, 10, false)
      ON CONFLICT DO NOTHING
    `);

    // Postres
    await db.query(`
      INSERT INTO products (restaurant_id, category_id, name, description, base_price, stock_quantity, low_stock_threshold, is_available)
      VALUES 
        (1, 6, 'Flan Mexicano', 'Flan casero con caramelo', 45.00, 16, 5, true),
        (1, 6, 'Pastel de Chocolate', 'Pastel de chocolate casero', 55.00, 2, 5, true),
        (1, 6, 'Helado Artesanal', 'Helado variado artesanal', 35.00, 25, 5, true),
        (1, 6, 'Tiramisú', 'Postre italiano cremoso', 50.00, 0, 5, false),
        (1, 6, 'Churros con Chocolate', 'Churros caseros', 30.00, 31, 5, true)
      ON CONFLICT DO NOTHING
    `);

    // Ensaladas
    await db.query(`
      INSERT INTO products (restaurant_id, category_id, name, description, base_price, stock_quantity, low_stock_threshold, is_available)
      VALUES 
        (1, 7, 'Ensalada César', 'Lechuga romana con aderezo', 55.00, 19, 5, true),
        (1, 7, 'Ensalada Griega', 'Tomate, queso feta, olivas', 60.00, 11, 5, true),
        (1, 7, 'Ensalada Mixta', 'Verduras variadas frescas', 45.00, 27, 5, true),
        (1, 7, 'Ensalada de Pollo', 'Ensalada con pollo', 70.00, 0, 5, false),
        (1, 7, 'Ensalada Caprese', 'Tomate, mozarela, albahaca', 65.00, 8, 5, true)
      ON CONFLICT DO NOTHING
    `);

    console.log('✓ Productos insertados (35 productos)');

    // 5. Insertar órdenes
    await db.query(`
      INSERT INTO orders (table_id, restaurant_id, status, created_at)
      VALUES 
        (1, 1, 'COMPLETED', NOW() - INTERVAL '3 days'),
        (2, 1, 'COMPLETED', NOW() - INTERVAL '3 days'),
        (3, 1, 'COMPLETED', NOW() - INTERVAL '2 days'),
        (4, 1, 'COMPLETED', NOW() - INTERVAL '2 days'),
        (5, 1, 'COMPLETED', NOW() - INTERVAL '1 day'),
        (6, 1, 'COMPLETED', NOW() - INTERVAL '1 day'),
        (7, 1, 'COMPLETED', NOW() - INTERVAL '1 day'),
        (8, 1, 'COMPLETED', NOW() - INTERVAL '1 day'),
        (1, 1, 'PENDING', NOW()),
        (2, 1, 'CONFIRMED', NOW()),
        (3, 1, 'PREPARING', NOW()),
        (4, 1, 'READY', NOW())
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Órdenes insertadas (12 órdenes)');

    // 6. Insertar order items
    await db.query(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase)
      VALUES 
        (1, 1, 1, 85.00),
        (1, 11, 1, 45.00),
        (1, 16, 2, 20.00),
        (2, 4, 2, 65.00),
        (2, 21, 1, 55.00),
        (3, 6, 3, 45.00),
        (3, 26, 2, 35.00),
        (4, 10, 1, 100.00),
        (4, 31, 1, 45.00),
        (5, 1, 1, 85.00),
        (5, 11, 1, 45.00),
        (5, 16, 1, 20.00),
        (6, 13, 1, 85.00),
        (6, 23, 1, 140.00),
        (6, 26, 1, 35.00),
        (7, 21, 2, 55.00),
        (7, 16, 2, 20.00),
        (8, 6, 4, 45.00),
        (8, 26, 2, 35.00),
        (9, 1, 1, 85.00),
        (9, 16, 2, 20.00),
        (10, 6, 2, 45.00),
        (10, 26, 1, 35.00),
        (11, 13, 1, 85.00),
        (11, 23, 1, 140.00),
        (12, 21, 1, 55.00),
        (12, 26, 1, 35.00)
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Items de órdenes insertados (27 items)');

    // 7. Insertar reembolsos
    await db.query(`
      INSERT INTO refunds (order_id, amount, reason, status, created_at)
      VALUES 
        (3, 125.00, 'Cliente solicitó cancelación', 'PENDING', NOW() - INTERVAL '1 day'),
        (4, 210.00, 'Producto defectuoso', 'APPROVED', NOW() - INTERVAL '12 hours'),
        (5, 130.00, 'Error de orden', 'PROCESSED', NOW() - INTERVAL '6 hours'),
        (6, 175.00, 'Cliente no satisfecho', 'REJECTED', NOW() - INTERVAL '2 hours'),
        (7, 105.00, 'Cancelación de mesa', 'PENDING', NOW() - INTERVAL '1 hour')
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Reembolsos insertados (5 reembolsos)');

    // 8. Actualizar estado de orden con reembolso procesado
    await db.query(`
      UPDATE orders SET status = 'REFUNDED' WHERE id = 5
    `);
    console.log('✓ Estado de orden actualizado');

    console.log('\n✅ ¡Datos de prueba insertados exitosamente!');
    console.log('\nResumen:');
    console.log('- 1 Restaurante');
    console.log('- 10 Mesas');
    console.log('- 7 Categorías');
    console.log('- 35 Productos (con stock variado)');
    console.log('- 12 Órdenes (8 completadas, 4 en curso)');
    console.log('- 27 Items de órdenes');
    console.log('- 5 Reembolsos en diferentes estados');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error insertando datos de prueba:', error.message);
    process.exit(1);
  }
};

seedTestData();
