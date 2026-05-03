-- ======================================================
-- SEED MODIFICADO PARA PRUEBAS INTEGRALES DE LA BD
-- SIN IMÁGENES Y CON HISTORIAL DE PEDIDOS
-- ======================================================

-- 1. LIMPIAR TABLAS (OPCIONAL, PARA RE-EJECUCIÓN)
TRUNCATE TABLE refunds, payments, order_item_options, order_items, orders, 
             cart_items, carts, options, product_option_groups, option_groups,
             product_availability, products, categories,
             restaurant_hours, restaurants, user_roles, delivery_addresses, users,
             roles, pedido_items_historial, pedido_historial RESTART IDENTITY CASCADE;

-- 2. ROLES
INSERT INTO roles (name, permisos) VALUES
('client', '{"ver_menu","hacer_pedido","ver_historial"}'),
('restaurant_admin', '{"gestionar_restaurante","gestionar_menu","ver_reportes"}'),
('chef', '{"ver_pedidos_pendientes","actualizar_estado_cocina"}'),
('repartidor', '{"ver_pedidos_asignados","actualizar_entrega"}');

-- 3. USUARIOS
WITH inserted_users AS (
    INSERT INTO users (email, password_hash, full_name, phone_number, reset_token, token_expiracion)
    VALUES
        ('cliente1@test.com', 'hash_cliente1', 'Carlos López', '5512345678', NULL, NULL),
        ('cliente2@test.com', 'hash_cliente2', 'María García', '5512345679', NULL, NULL),
        ('admin_rest1@test.com', 'hash_admin1', 'Javier Martínez', '5512345680', NULL, NULL),
        ('chef1@test.com', 'hash_chef1', 'Ana Rodríguez', '5512345681', NULL, NULL),
        ('repartidor1@test.com', 'hash_repart1', 'Luis Fernández', '5512345682', NULL, NULL),
        ('repartidor2@test.com', 'hash_repart2', 'Elena Torres', '5512345683', NULL, NULL),
        ('cliente_inactivo@test.com', 'hash_inactivo', 'Pedro Infante', '5512345684', NULL, NULL)
    RETURNING id, email
)
INSERT INTO user_roles (user_id, role_id)
SELECT 
    u.id,
    r.id
FROM inserted_users u
CROSS JOIN roles r
WHERE (u.email = 'cliente1@test.com' AND r.name = 'client')
   OR (u.email = 'cliente2@test.com' AND r.name = 'client')
   OR (u.email = 'admin_rest1@test.com' AND r.name = 'restaurant_admin')
   OR (u.email = 'chef1@test.com' AND r.name = 'chef')
   OR (u.email = 'repartidor1@test.com' AND r.name = 'repartidor')
   OR (u.email = 'repartidor2@test.com' AND r.name = 'repartidor')
   OR (u.email = 'cliente_inactivo@test.com' AND r.name = 'client');

-- 4. DIRECCIONES DE ENTREGA
INSERT INTO delivery_addresses (customer_id, street, exterior_number, interior_number, neighborhood, city, state, postal_code, delivery_references)
SELECT 
    u.id, 'Calle Reforma', '123', 'B', 'Centro', 'Ciudad de México', 'CDMX', '06000', 'Junto a la torre latino'
FROM users u WHERE u.email = 'cliente1@test.com'
UNION ALL
SELECT u.id, 'Av. Insurgentes', '456', NULL, 'Del Valle', 'Ciudad de México', 'CDMX', '03100', 'Frente al metrobús'
FROM users u WHERE u.email = 'cliente2@test.com'
UNION ALL
SELECT u.id, 'Calle 5 de Mayo', '789', 'PB', 'Centro', 'Guadalajara', 'Jalisco', '44100', 'Tienda de la esquina'
FROM users u WHERE u.email = 'cliente_inactivo@test.com';

-- 5. RESTAURANTES
INSERT INTO restaurants (owner_user_id, name, latitude, longitude, tax_id, is_active)
SELECT u.id, 'Tacos El Buen Sabor', 19.432608, -99.133209, 'TAX123456', true
FROM users u WHERE u.email = 'admin_rest1@test.com'
UNION ALL
SELECT u.id, 'Pizzeria Roma', 19.415000, -99.167000, 'TAX789012', true
FROM users u WHERE u.email = 'admin_rest1@test.com';

-- 6. HORARIOS DE RESTAURANTES
WITH rest AS (
    SELECT id, name FROM restaurants WHERE name IN ('Tacos El Buen Sabor', 'Pizzeria Roma')
)
INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time)
SELECT r.id, 1, '10:00', '22:00' FROM rest r WHERE r.name = 'Tacos El Buen Sabor'
UNION ALL SELECT r.id, 2, '10:00', '22:00' FROM rest r WHERE r.name = 'Tacos El Buen Sabor'
UNION ALL SELECT r.id, 3, '10:00', '22:00' FROM rest r WHERE r.name = 'Tacos El Buen Sabor'
UNION ALL SELECT r.id, 4, '10:00', '22:00' FROM rest r WHERE r.name = 'Tacos El Buen Sabor'
UNION ALL SELECT r.id, 5, '10:00', '23:00' FROM rest r WHERE r.name = 'Tacos El Buen Sabor'
UNION ALL SELECT r.id, 6, '12:00', '00:00' FROM rest r WHERE r.name = 'Tacos El Buen Sabor'
UNION ALL SELECT r.id, 0, '12:00', '20:00' FROM rest r WHERE r.name = 'Tacos El Buen Sabor'
UNION ALL SELECT r.id, 1, '09:00', '23:00' FROM rest r WHERE r.name = 'Pizzeria Roma'
UNION ALL SELECT r.id, 2, '09:00', '23:00' FROM rest r WHERE r.name = 'Pizzeria Roma'
UNION ALL SELECT r.id, 3, '09:00', '23:00' FROM rest r WHERE r.name = 'Pizzeria Roma'
UNION ALL SELECT r.id, 4, '09:00', '23:00' FROM rest r WHERE r.name = 'Pizzeria Roma'
UNION ALL SELECT r.id, 5, '09:00', '00:00' FROM rest r WHERE r.name = 'Pizzeria Roma'
UNION ALL SELECT r.id, 6, '11:00', '01:00' FROM rest r WHERE r.name = 'Pizzeria Roma'
UNION ALL SELECT r.id, 0, '11:00', '21:00' FROM rest r WHERE r.name = 'Pizzeria Roma';

-- 7. CATEGORÍAS
INSERT INTO categories (restaurant_id, name, descripcion)
SELECT r.id, 'Tacos', 'Tacos de diversos guisos' FROM restaurants r WHERE r.name = 'Tacos El Buen Sabor'
UNION ALL
SELECT r.id, 'Bebidas', 'Refrescos, aguas frescas' FROM restaurants r WHERE r.name = 'Tacos El Buen Sabor'
UNION ALL
SELECT r.id, 'Pizzas', 'Pizzas artesanales' FROM restaurants r WHERE r.name = 'Pizzeria Roma'
UNION ALL
SELECT r.id, 'Entradas', 'Entradas y aperitivos' FROM restaurants r WHERE r.name = 'Pizzeria Roma';

-- 8. PRODUCTOS (sin imágenes)
WITH cats AS (
    SELECT c.id, c.name, r.name as rest_name
    FROM categories c JOIN restaurants r ON c.restaurant_id = r.id
)
INSERT INTO products (category_id, descripcion, name, base_price, is_available, is_active, stock, deleted_at)
SELECT c.id, 'Taco de pastor con piña', 'Taco al pastor', 18.00, true, true, 50, NULL
FROM cats c WHERE c.name = 'Tacos' AND c.rest_name = 'Tacos El Buen Sabor'
UNION ALL
SELECT c.id, 'Taco de bistec con cebolla', 'Taco de bistec', 20.00, true, true, 30, NULL
FROM cats c WHERE c.name = 'Tacos' AND c.rest_name = 'Tacos El Buen Sabor'
UNION ALL
SELECT c.id, 'Agua de horchata', 'Horchata', 25.00, true, true, 100, NULL
FROM cats c WHERE c.name = 'Bebidas' AND c.rest_name = 'Tacos El Buen Sabor'
UNION ALL
-- Producto agotado (stock=0) -> is_available debe ser false (CHECK constraint)
SELECT c.id, 'Taco de carnitas (agotado)', 'Carnitas', 22.00, false, true, 0, NULL
FROM cats c WHERE c.name = 'Tacos' AND c.rest_name = 'Tacos El Buen Sabor'
UNION ALL
-- Producto eliminado lógicamente (deleted_at not null)
SELECT c.id, 'Taco de lengua (descontinuado)', 'Lengua', 25.00, false, false, 0, NOW()
FROM cats c WHERE c.name = 'Tacos' AND c.rest_name = 'Tacos El Buen Sabor'
UNION ALL
-- Pizzas
SELECT c.id, 'Pepperoni clásico', 'Pizza Pepperoni', 150.00, true, true, 20, NULL
FROM cats c WHERE c.name = 'Pizzas' AND c.rest_name = 'Pizzeria Roma'
UNION ALL
SELECT c.id, 'Cuatro quesos', 'Pizza Quesos', 180.00, true, true, 15, NULL
FROM cats c WHERE c.name = 'Pizzas' AND c.rest_name = 'Pizzeria Roma'
UNION ALL
SELECT c.id, 'Aros de cebolla', 'Aros de cebolla', 55.00, true, true, 40, NULL
FROM cats c WHERE c.name = 'Entradas' AND c.rest_name = 'Pizzeria Roma';

-- 9. DISPONIBILIDAD DE PRODUCTOS (US020)
WITH pastor AS (SELECT id FROM products WHERE name = 'Taco al pastor')
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time)
SELECT id, 1, '13:00', '17:00' FROM pastor
UNION ALL SELECT id, 2, '13:00', '17:00' FROM pastor
UNION ALL SELECT id, 3, '13:00', '17:00' FROM pastor
UNION ALL SELECT id, 4, '13:00', '17:00' FROM pastor
UNION ALL SELECT id, 5, '13:00', '18:00' FROM pastor;

WITH pepperoni AS (SELECT id FROM products WHERE name = 'Pizza Pepperoni')
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time)
SELECT id, 1, '18:00', '23:00' FROM pepperoni
UNION ALL SELECT id, 2, '18:00', '23:00' FROM pepperoni
UNION ALL SELECT id, 3, '18:00', '23:00' FROM pepperoni
UNION ALL SELECT id, 4, '18:00', '23:00' FROM pepperoni
UNION ALL SELECT id, 5, '18:00', '23:00' FROM pepperoni
UNION ALL SELECT id, 6, '18:00', '00:00' FROM pepperoni
UNION ALL SELECT id, 0, '18:00', '22:00' FROM pepperoni;

-- 10. GRUPOS DE OPCIONES Y OPCIONES
WITH rest_tacos AS (SELECT id FROM restaurants WHERE name = 'Tacos El Buen Sabor')
INSERT INTO option_groups (restaurant_id, name, min_selection, max_selection)
SELECT id, 'Tamaño de taco', 1, 1 FROM rest_tacos
UNION ALL
SELECT id, 'Salsas extra', 0, 3 FROM rest_tacos;

WITH rest_pizza AS (SELECT id FROM restaurants WHERE name = 'Pizzeria Roma')
INSERT INTO option_groups (restaurant_id, name, min_selection, max_selection)
SELECT id, 'Tipo de masa', 1, 1 FROM rest_pizza
UNION ALL
SELECT id, 'Ingredientes extra', 0, 4 FROM rest_pizza;

-- Asociar grupos a productos
WITH 
    taco AS (SELECT id FROM products WHERE name = 'Taco al pastor'),
    grupo_tamano AS (SELECT og.id FROM option_groups og JOIN restaurants r ON og.restaurant_id = r.id WHERE r.name = 'Tacos El Buen Sabor' AND og.name = 'Tamaño de taco'),
    grupo_salsas AS (SELECT og.id FROM option_groups og JOIN restaurants r ON og.restaurant_id = r.id WHERE r.name = 'Tacos El Buen Sabor' AND og.name = 'Salsas extra')
INSERT INTO product_option_groups (product_id, option_group_id)
SELECT t.id, gt.id FROM taco t, grupo_tamano gt
UNION ALL
SELECT t.id, gs.id FROM taco t, grupo_salsas gs;

WITH 
    pizza AS (SELECT id FROM products WHERE name = 'Pizza Pepperoni'),
    grupo_masa AS (SELECT og.id FROM option_groups og JOIN restaurants r ON og.restaurant_id = r.id WHERE r.name = 'Pizzeria Roma' AND og.name = 'Tipo de masa'),
    grupo_ingredientes AS (SELECT og.id FROM option_groups og JOIN restaurants r ON og.restaurant_id = r.id WHERE r.name = 'Pizzeria Roma' AND og.name = 'Ingredientes extra')
INSERT INTO product_option_groups (product_id, option_group_id)
SELECT p.id, gm.id FROM pizza p, grupo_masa gm
UNION ALL
SELECT p.id, gi.id FROM pizza p, grupo_ingredientes gi;

-- Opciones concretas
INSERT INTO options (option_group_id, name, price_modifier)
SELECT og.id, 'Chico', 0.00 FROM option_groups og WHERE og.name = 'Tamaño de taco'
UNION ALL
SELECT og.id, 'Grande', 5.00 FROM option_groups og WHERE og.name = 'Tamaño de taco'
UNION ALL
SELECT og.id, 'Mega', 10.00 FROM option_groups og WHERE og.name = 'Tamaño de taco'
UNION ALL
SELECT og.id, 'Salsa roja', 3.00 FROM option_groups og WHERE og.name = 'Salsas extra'
UNION ALL
SELECT og.id, 'Salsa verde', 3.00 FROM option_groups og WHERE og.name = 'Salsas extra'
UNION ALL
SELECT og.id, 'Salsa de aguacate', 5.00 FROM option_groups og WHERE og.name = 'Salsas extra'
UNION ALL
SELECT og.id, 'Delgada', 0.00 FROM option_groups og WHERE og.name = 'Tipo de masa'
UNION ALL
SELECT og.id, 'Gruesa', 15.00 FROM option_groups og WHERE og.name = 'Tipo de masa'
UNION ALL
SELECT og.id, 'Champiñones', 12.00 FROM option_groups og WHERE og.name = 'Ingredientes extra'
UNION ALL
SELECT og.id, 'Jalapeños', 8.00 FROM option_groups og WHERE og.name = 'Ingredientes extra'
UNION ALL
SELECT og.id, 'Pepperoni extra', 20.00 FROM option_groups og WHERE og.name = 'Ingredientes extra';

-- 11. CARRITOS
-- Cliente1 tiene carro activo en tacos
WITH cliente1 AS (SELECT id FROM users WHERE email = 'cliente1@test.com'),
     rest1 AS (SELECT id FROM restaurants WHERE name = 'Tacos El Buen Sabor')
INSERT INTO carts (customer_id, restaurant_id, status)
SELECT c.id, r.id, 'ACTIVE' FROM cliente1 c, rest1 r;

-- Mismo cliente con un carro ya finalizado (CHECKED_OUT)
INSERT INTO carts (customer_id, restaurant_id, status)
SELECT c.id, r.id, 'CHECKED_OUT' FROM cliente1 c, rest1 r;

-- Cliente2 con carro activo en pizzeria
WITH cliente2 AS (SELECT id FROM users WHERE email = 'cliente2@test.com'),
     rest2 AS (SELECT id FROM restaurants WHERE name = 'Pizzeria Roma')
INSERT INTO carts (customer_id, restaurant_id, status)
SELECT c.id, r.id, 'ACTIVE' FROM cliente2 c, rest2 r;

-- 12. ITEMS DEL CARRITO ACTIVO (cliente1)
WITH cart_activo AS (
    SELECT c.id AS cart_id, p.id AS product_id, p.base_price
    FROM carts c
    JOIN users u ON c.customer_id = u.id
    JOIN products p ON p.name = 'Taco al pastor'
    WHERE u.email = 'cliente1@test.com' AND c.status = 'ACTIVE'
)
INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
SELECT cart_id, product_id, 3, base_price FROM cart_activo
UNION ALL
SELECT cart_id, (SELECT id FROM products WHERE name = 'Horchata'), 2, (SELECT base_price FROM products WHERE name = 'Horchata')
FROM cart_activo;

-- 13. PEDIDOS EN TABLA orders (estados: PENDING, PREPARING, READY, DELIVERY_ASSIGNED)
-- Pedido 1: PENDING
WITH cliente1 AS (SELECT id FROM users WHERE email = 'cliente1@test.com'),
     rest_taco AS (SELECT id FROM restaurants WHERE name = 'Tacos El Buen Sabor'),
     dir_cliente1 AS (SELECT street, exterior_number, neighborhood, city, state, postal_code, delivery_references 
                      FROM delivery_addresses WHERE customer_id = (SELECT id FROM users WHERE email = 'cliente1@test.com') LIMIT 1)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, deliveryman_id, status, note, total_amount)
SELECT c.id, r.id, 
       jsonb_build_object('street', d.street, 'ext_num', d.exterior_number, 'neighborhood', d.neighborhood, 
                          'city', d.city, 'state', d.state, 'postal_code', d.postal_code, 'references', d.delivery_references),
       NULL, 'PENDING', 'Sin cebolla, por favor', 79.00
FROM cliente1 c, rest_taco r, dir_cliente1 d;

-- Pedido 2: PREPARING
WITH cliente2 AS (SELECT id FROM users WHERE email = 'cliente2@test.com'),
     rest_pizza AS (SELECT id FROM restaurants WHERE name = 'Pizzeria Roma'),
     repartidor AS (SELECT id FROM users WHERE email = 'repartidor1@test.com'),
     dir_cliente2 AS (SELECT street, exterior_number, neighborhood, city, state, postal_code, delivery_references 
                      FROM delivery_addresses WHERE customer_id = (SELECT id FROM users WHERE email = 'cliente2@test.com') LIMIT 1)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, deliveryman_id, status, note, total_amount)
SELECT c.id, r.id, 
       jsonb_build_object('street', d.street, 'ext_num', d.exterior_number, 'neighborhood', d.neighborhood, 
                          'city', d.city, 'state', d.state, 'postal_code', d.postal_code, 'references', d.delivery_references),
       rep.id, 'PREPARING', 'Orilla bien cocida', 350.00
FROM cliente2 c, rest_pizza r, repartidor rep, dir_cliente2 d;

-- Pedido 3: READY
WITH cliente1 AS (SELECT id FROM users WHERE email = 'cliente1@test.com'),
     rest_taco AS (SELECT id FROM restaurants WHERE name = 'Tacos El Buen Sabor'),
     dir_cliente1 AS (SELECT street, exterior_number, neighborhood, city, state, postal_code, delivery_references 
                      FROM delivery_addresses WHERE customer_id = (SELECT id FROM users WHERE email = 'cliente1@test.com') LIMIT 1)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, deliveryman_id, status, note, total_amount)
SELECT c.id, r.id, 
       jsonb_build_object('street', d.street, 'ext_num', d.exterior_number, 'neighborhood', d.neighborhood, 
                          'city', d.city, 'state', d.state, 'postal_code', d.postal_code, 'references', d.delivery_references),
       NULL, 'READY', 'Todo bien', 150.00
FROM cliente1 c, rest_taco r, dir_cliente1 d;

-- Pedido 4: DELIVERY_ASSIGNED
WITH cliente_inactivo AS (SELECT id FROM users WHERE email = 'cliente_inactivo@test.com'),
     rest_pizza AS (SELECT id FROM restaurants WHERE name = 'Pizzeria Roma'),
     repartidor2 AS (SELECT id FROM users WHERE email = 'repartidor2@test.com'),
     dir_inactivo AS (SELECT street, exterior_number, neighborhood, city, state, postal_code, delivery_references 
                      FROM delivery_addresses WHERE customer_id = (SELECT id FROM users WHERE email = 'cliente_inactivo@test.com') LIMIT 1)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, deliveryman_id, status, note, total_amount)
SELECT c.id, r.id, 
       jsonb_build_object('street', d.street, 'ext_num', d.exterior_number, 'neighborhood', d.neighborhood, 
                          'city', d.city, 'state', d.state, 'postal_code', d.postal_code, 'references', d.delivery_references),
       rep.id, 'DELIVERY_ASSIGNED', 'Entregar en departamento 3B', 220.00
FROM cliente_inactivo c, rest_pizza r, repartidor2 rep, dir_inactivo d;

-- 14. DETALLES DE PEDIDOS (order_items) y opciones
-- Pedido 1: 2 tacos, 1 horchata
WITH pedido1 AS (SELECT id FROM orders WHERE status = 'PENDING' AND total_amount = 79.00),
     prod_pastor AS (SELECT id, base_price FROM products WHERE name = 'Taco al pastor'),
     prod_horchata AS (SELECT id, base_price FROM products WHERE name = 'Horchata')
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase)
SELECT p.id, pp.id, 2, pp.base_price FROM pedido1 p, prod_pastor pp
UNION ALL
SELECT p.id, ph.id, 1, ph.base_price FROM pedido1 p, prod_horchata ph;

-- Opciones para el primer taco del pedido1
WITH item_taco AS (
    SELECT oi.id AS order_item_id, opt.id AS option_id, opt.price_modifier
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products pr ON oi.product_id = pr.id
    JOIN options opt ON opt.name IN ('Grande', 'Salsa roja')
    WHERE o.status = 'PENDING' AND pr.name = 'Taco al pastor'
    LIMIT 1
)
INSERT INTO order_item_options (order_item_id, option_id, price_at_purchase)
SELECT order_item_id, option_id, price_modifier FROM item_taco;

-- Pedido 2: pizza pepperoni
WITH pedido2 AS (SELECT id FROM orders WHERE status = 'PREPARING'),
     prod_pizza AS (SELECT id, base_price FROM products WHERE name = 'Pizza Pepperoni')
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase)
SELECT p.id, pp.id, 1, pp.base_price FROM pedido2 p, prod_pizza pp;

-- Opciones para esa pizza
WITH item_pizza AS (
    SELECT oi.id AS order_item_id, opt.id AS option_id, opt.price_modifier
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products pr ON oi.product_id = pr.id
    JOIN options opt ON opt.name IN ('Gruesa', 'Champiñones')
    WHERE o.status = 'PREPARING' AND pr.name = 'Pizza Pepperoni'
)
INSERT INTO order_item_options (order_item_id, option_id, price_at_purchase)
SELECT order_item_id, option_id, price_modifier FROM item_pizza;

-- 15. PAGOS Y REEMBOLSOS
-- Pago exitoso para pedido 1
WITH pedido1 AS (SELECT id FROM orders WHERE status = 'PENDING' AND total_amount = 79.00)
INSERT INTO payments (order_id, payment_method, status, transaction_id)
SELECT id, 'CARD', 'SUCCESS', 'txn_123456789' FROM pedido1;

-- Pago fallido para pedido 2 (luego reembolsado)
WITH pedido2 AS (SELECT id FROM orders WHERE status = 'PREPARING')
INSERT INTO payments (order_id, payment_method, status, transaction_id)
SELECT id, 'CARD', 'FAILED', 'txn_failed_001' FROM pedido2;

-- Reembolso asociado al pago fallido
WITH pago_fallido AS (SELECT id FROM payments WHERE transaction_id = 'txn_failed_001')
INSERT INTO refunds (payment_id, amount, reason)
SELECT id, 350.00, 'Fallo en el cobro, se reembolsa el monto completo' FROM pago_fallido;

-- 16. HISTORIAL DE PEDIDOS (pedido_historial) y sus items
-- Pedido cancelado
WITH cliente1 AS (SELECT id FROM users WHERE email = 'cliente1@test.com'),
     rest_taco AS (SELECT id FROM restaurants WHERE name = 'Tacos El Buen Sabor')
INSERT INTO pedido_historial (customer_id, restaurant_id, delivery_address_json, status, total_amount, refund_rejection_reason)
SELECT c.id, r.id, 
       jsonb_build_object('street', 'Calle Ejemplo', 'city', 'CDMX'),
       'CANCELLED', 45.00, 'Cliente canceló por cambio de horario'
FROM cliente1 c, rest_taco r;

-- Pedido completado
WITH cliente2 AS (SELECT id FROM users WHERE email = 'cliente2@test.com'),
     rest_pizza AS (SELECT id FROM restaurants WHERE name = 'Pizzeria Roma')
INSERT INTO pedido_historial (customer_id, restaurant_id, delivery_address_json, status, total_amount, refund_rejection_reason)
SELECT c.id, r.id, 
       jsonb_build_object('street', 'Av. Siempre Viva', 'city', 'Guadalajara'),
       'COMPLETED', 520.00, NULL
FROM cliente2 c, rest_pizza r;

-- Pedido reembolsado
INSERT INTO pedido_historial (customer_id, restaurant_id, delivery_address_json, status, total_amount, refund_rejection_reason)
SELECT u.id, r.id, 
       jsonb_build_object('street', 'Zona reembolso', 'city', 'Monterrey'),
       'REFUNDED', 99.00, NULL
FROM users u, restaurants r
WHERE u.email = 'cliente_inactivo@test.com' AND r.name = 'Tacos El Buen Sabor';

-- Pedido con reembolso rechazado
INSERT INTO pedido_historial (customer_id, restaurant_id, delivery_address_json, status, total_amount, refund_rejection_reason)
SELECT u.id, r.id, 
       jsonb_build_object('street', 'Colonia Progreso', 'city', 'Puebla'),
       'REFUND_REJECTED', 120.00, 'El producto ya fue consumido'
FROM users u, restaurants r
WHERE u.email = 'cliente1@test.com' AND r.name = 'Pizzeria Roma';

-- Items para el pedido cancelado (CANCELLED)
WITH hist_cancelado AS (SELECT id FROM pedido_historial WHERE status = 'CANCELLED' LIMIT 1),
     prod_pastor AS (SELECT id, base_price FROM products WHERE name = 'Taco al pastor')
INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
SELECT h.id, p.id, 2, p.base_price FROM hist_cancelado h, prod_pastor p;

-- Items para el pedido completado (COMPLETED)
WITH hist_completado AS (SELECT id FROM pedido_historial WHERE status = 'COMPLETED' LIMIT 1),
     prod_pizza AS (SELECT id, base_price FROM products WHERE name = 'Pizza Pepperoni')
INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
SELECT h.id, p.id, 1, p.base_price FROM hist_completado h, prod_pizza p;

-- Items para el pedido reembolsado (REFUNDED)
WITH hist_refunded AS (SELECT id FROM pedido_historial WHERE status = 'REFUNDED' LIMIT 1),
     prod_horchata AS (SELECT id, base_price FROM products WHERE name = 'Horchata')
INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
SELECT h.id, p.id, 2, p.base_price FROM hist_refunded h, prod_horchata p;

-- Items para el pedido con reembolso rechazado
WITH hist_rejected AS (SELECT id FROM pedido_historial WHERE status = 'REFUND_REJECTED' LIMIT 1),
     prod_bistec AS (SELECT id, base_price FROM products WHERE name = 'Taco de bistec')
INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
SELECT h.id, p.id, 3, p.base_price FROM hist_rejected h, prod_bistec p;