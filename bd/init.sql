-- =============================================
-- PROYECTO: SISTEMA DE PEDIDOS PARA RESTAURANTES
-- EQUIPO: No. 3
-- DESCRIPCIÓN: Script Único de Persistencia (Sprint 4)
-- =============================================

-- 1. LIMPIEZA DE TABLAS
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_item_options CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_option_groups CASCADE;
DROP TABLE IF EXISTS options CASCADE;
DROP TABLE IF EXISTS option_groups CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS restaurant_hours CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

-- =============================================
-- 2. USUARIOS Y ROLES
-- =============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE
);

CREATE TABLE user_roles (
    user_id INT REFERENCES users(id),
    role_id INT REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- =============================================
-- 3. RESTAURANTES
-- =============================================

CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    owner_user_id INT REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE restaurant_hours (
    id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id),
    day_of_week INT,
    open_time TIME,
    close_time TIME
);

-- =============================================
-- 4. CATEGORÍAS
-- =============================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id),
    name VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- =============================================
-- 5. PRODUCTS (MODIFICADO PARA SPRINT 4)
-- =============================================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,

    category_id INT REFERENCES categories(id),
    descripcion TEXT NULL,

    name VARCHAR(100) NOT NULL,

    base_price DECIMAL(10,2) NOT NULL,

    -- disponibilidad temporal (stock agotado o cocina cerrada)
    is_available BOOLEAN DEFAULT TRUE,

    -- eliminación lógica del plato (US005.3)
    is_active BOOLEAN DEFAULT TRUE,

    -- control de inventario (US005.5)
    stock INTEGER DEFAULT 0,
    deleted_at TIMESTAMP NULL
);

-- =============================================
-- 6. IMÁGENES DE PRODUCTOS (US009)
-- =============================================

CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,

    product_id INT NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    image_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT,
    format VARCHAR(10),

    is_primary BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_product_images_product_id
ON product_images(product_id);

CREATE INDEX idx_product_images_is_primary
ON product_images(is_primary);

-- =============================================
-- 6. DISPONIBILIDAD DE PRODUCTOS (US020)
-- =============================================

CREATE TABLE product_availability (
    id SERIAL PRIMARY KEY,

    product_id INT NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_availability_product
ON product_availability(product_id);

CREATE INDEX idx_product_availability_day
ON product_availability(day_of_week);

-- =============================================
-- 7. OPCIONES DE MENÚ
-- =============================================

CREATE TABLE option_groups (
    id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id),
    name VARCHAR(100),
    min_selection INT DEFAULT 0,
    max_selection INT
);

CREATE TABLE product_option_groups (
    product_id INT REFERENCES products(id),
    option_group_id INT REFERENCES option_groups(id),
    PRIMARY KEY (product_id, option_group_id)
);

CREATE TABLE options (
    id SERIAL PRIMARY KEY,
    option_group_id INT REFERENCES option_groups(id),
    name VARCHAR(100),
    price_modifier DECIMAL(10,2) DEFAULT 0.00
);

-- =============================================
-- 8. PEDIDOS
-- =============================================

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id),
    restaurant_id INT REFERENCES restaurants(id),

    delivery_address_json JSONB,

    status VARCHAR(50) DEFAULT 'PENDING',

    total_amount DECIMAL(10,2),

    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_order_status CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELED', 'DELIVERED'))
);

CREATE TABLE customer_product_preferences (
    id SERIAL PRIMARY KEY,

    customer_id INT NOT NULL REFERENCES users(id),
    product_id INT NOT NULL REFERENCES products(id),

    order_count INT DEFAULT 0, -- cuántas veces lo pidió
    last_ordered_at TIMESTAMP, -- última vez que lo pidió

    score DECIMAL(10,4), -- métrica ponderada

    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (customer_id, product_id)
);

CREATE TABLE customer_recommendations (
    id SERIAL PRIMARY KEY,

    customer_id INT NOT NULL REFERENCES users(id),

    product_id INT NOT NULL REFERENCES products(id),

    score DECIMAL(10,4),

    rank INT, -- posición (1 a 5)

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (customer_id, product_id)
);


CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,

    order_id INT REFERENCES orders(id),

    product_id INT REFERENCES products(id),

    quantity INT NOT NULL,

    -- preserva precio histórico
    unit_price_at_purchase DECIMAL(10,2)
);

CREATE TABLE order_item_options (
    id SERIAL PRIMARY KEY,

    order_item_id INT REFERENCES order_items(id),

    option_id INT REFERENCES options(id),

    price_at_purchase DECIMAL(10,2)
);

-- =============================================
-- 9. PAGOS
-- =============================================

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,

    order_id INT REFERENCES orders(id),

    payment_method VARCHAR(50),

    status VARCHAR(50) DEFAULT 'PENDING',

    transaction_id VARCHAR(100),

    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 10. PROMOCIONES
-- =============================================

CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,

    restaurant_id INT REFERENCES restaurants(id),

    code VARCHAR(50) UNIQUE NOT NULL,

    discount_percentage DECIMAL(5,2) NOT NULL,

    start_date TIMESTAMP,

    end_date TIMESTAMP,

    is_active BOOLEAN DEFAULT TRUE
);

-- =============================================
-- 11. REVIEWS
-- =============================================

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,

    order_id INT REFERENCES orders(id),

    customer_id INT REFERENCES users(id),

    restaurant_id INT REFERENCES restaurants(id),

    rating INT CHECK (rating >= 1 AND rating <= 5),

    comment TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_status 
ON orders(customer_id, status);

CREATE INDEX idx_order_items_product 
ON order_items(product_id);

CREATE INDEX idx_preferences_customer 
ON customer_product_preferences(customer_id);

CREATE INDEX idx_recommendations_customer 
ON customer_recommendations(customer_id);


-- =============================================
-- 12. SEEDING
-- =============================================

INSERT INTO roles (name)
VALUES ('client'), ('restaurant_admin'), ('chef');

INSERT INTO users (email, full_name, phone_number)
VALUES
('cliente@ejemplo.com', 'Juan Perez', '5551234567'),
('admin@restaurante.com', 'Carlos Admin', '5559876543');

INSERT INTO user_roles VALUES
(1,1),
(2,2);

-- =============================================
-- 4. RESTAURANTES (Añadimos uno más)
-- =============================================
INSERT INTO restaurants (owner_user_id, name) VALUES 
(2, 'La Parrilla Mixteca'),
(2, 'Sushi Garden'); -- Carlos Admin también es dueño de este

-- =============================================
-- 5. CATEGORÍAS
-- =============================================
INSERT INTO categories (restaurant_id, name, descripcion) VALUES
(1, 'Hamburguesas', 'Especialidades al carbón'),
(1, 'Bebidas', 'Refrescos y aguas naturales'),
(1, 'Complementos', 'Papas y aros de cebolla'),
(2, 'Rollos Especiales', 'Sushi de autor con ingredientes frescos'),
(2, 'Entradas Japonesas', 'Edamames, gyozas y más');

-- =============================================
-- 6. PRODUCTOS (PLATOS)
-- =============================================

-- Productos para La Parrilla Mixteca (Restaurant_id 1, Categorías 1, 2, 3)
INSERT INTO products (category_id, name, base_price, stock) VALUES
(1, 'Hamburguesa Clásica', 85.00, 10),
(1, 'Hamburguesa BBQ Bacon', 110.00, 15),
(1, 'Hamburguesa Doble Queso', 135.00, 8),
(2, 'Agua de Jamaica 500ml', 25.00, 50),
(2, 'Refrescos Variados', 30.00, 100),
(3, 'Papas Gajo Sazonadas', 45.00, 20),
(3, 'Aros de Cebolla (8 pzs)', 55.00, 12);

-- Productos para Sushi Garden (Restaurant_id 2, Categorías 4, 5)
INSERT INTO products (category_id, name, base_price, stock) VALUES
(4, 'Philadelphia Roll', 95.00, 20),
(4, 'Dragon Roll Especial', 150.00, 10),
(4, 'Acevichado Roll', 140.00, 15),
(5, 'Gyozas de Cerdo (5 pzs)', 75.00, 30),
(5, 'Edamames al vapor', 60.00, 25);

-- =============================================
-- 13. DATOS DE PRUEBA PARA RANKING DE VENTAS
-- =============================================

-- =============================================
-- 13.1 PEDIDOS DE PRUEBA PARA LA PARRILLA MIXTECA (Restaurant_id 1)
-- =============================================

-- Pedido 1: 5 Hamburguesas Clásicas (Completado - hace 15 días)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at)
VALUES (
  1, 1, 
  '{"street":"Av. Reforma 123","city":"Ciudad de México","zip":"06500"}',
  'COMPLETED', 
  425.00, 
  NOW() - INTERVAL '15 days'
);

-- Pedido 2: 3 Hamburguesas BBQ Bacon + 2 Refrescos (Completado - hace 10 días)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at)
VALUES (
  1, 1,
  '{"street":"Av. Insurgentes 456","city":"Ciudad de México","zip":"06700"}',
  'COMPLETED',
  390.00,
  NOW() - INTERVAL '10 days'
);

-- Pedido 3: 2 Hamburguesas Doble Queso + 4 Papas Gajo (Completado - hace 8 días)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at)
VALUES (
  1, 1,
  '{"street":"Calle Durango 789","city":"Ciudad de México","zip":"06700"}',
  'COMPLETED',
  450.00,
  NOW() - INTERVAL '8 days'
);

-- Pedido 4: 4 Hamburguesas Clásicas + 6 Aguas de Jamaica (Completado - hace 5 días)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at)
VALUES (
  1, 1,
  '{"street":"Av. Universidad 1000","city":"Ciudad de México","zip":"04510"}',
  'COMPLETED',
  490.00,
  NOW() - INTERVAL '5 days'
);

-- Pedido 5: 1 Hamburguesa Doble Queso + 2 Aros de Cebolla (Completado - hace 3 días)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at)
VALUES (
  1, 1,
  '{"street":"Calle Coahuila 45","city":"Ciudad de México","zip":"06700"}',
  'COMPLETED',
  245.00,
  NOW() - INTERVAL '3 days'
);

-- Pedido 6: CANCELADO - 3 Hamburguesas Clásicas (No debe contar para el ranking)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at)
VALUES (
  1, 1,
  '{"street":"Av. Reforma 123","city":"Ciudad de México","zip":"06500"}',
  'CANCELED',
  255.00,
  NOW() - INTERVAL '2 days'
);

-- Pedido 7: 10 Hamburguesas BBQ Bacon + 5 Refrescos (Completado - hoy)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at)
VALUES (
  1, 1,
  '{"street":"Av. Insurgentes 456","city":"Ciudad de México","zip":"06700"}',
  'COMPLETED',
  1250.00,
  NOW()
);

-- =============================================
-- 13.2 ORDER_ITEMS PARA LA PARRILLA MIXTECA
-- =============================================

-- Pedido 1 (order_id = 1)
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase) VALUES
(1, 1, 5, 85.00); -- Hamburguesa Clásica

-- Pedido 2 (order_id = 2)
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase) VALUES
(2, 2, 3, 110.00), -- Hamburguesa BBQ Bacon
(2, 5, 2, 30.00);  -- Refrescos Variados

-- Pedido 3 (order_id = 3)
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase) VALUES
(3, 3, 2, 135.00), -- Hamburguesa Doble Queso
(3, 6, 4, 45.00);  -- Papas Gajo Sazonadas

-- Pedido 4 (order_id = 4)
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase) VALUES
(4, 1, 4, 85.00),  -- Hamburguesa Clásica
(4, 4, 6, 25.00);  -- Agua de Jamaica

-- Pedido 5 (order_id = 5)
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase) VALUES
(5, 3, 1, 135.00), -- Hamburguesa Doble Queso
(5, 7, 2, 55.00);  -- Aros de Cebolla

-- Pedido 6 (order_id = 6) - CANCELADO, no debe aparecer en ranking
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase) VALUES
(6, 1, 3, 85.00);  -- Hamburguesa Clásica

-- Pedido 7 (order_id = 7)
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase) VALUES
(7, 2, 10, 110.00), -- Hamburguesa BBQ Bacon
(7, 5, 5, 30.00);   -- Refrescos Variados

-- =============================================
-- 13.3 PEDIDOS DE PRUEBA PARA SUSHI GARDEN (Restaurant_id 2)
-- =============================================

-- Pedido 8: 8 Philadelphia Rolls + 4 Dragon Rolls (Completado - hace 12 días)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at)
VALUES (
  1, 2,
  '{"street":"Av. Polanco 200","city":"Ciudad de México","zip":"11550"}',
  'COMPLETED',
  1360.00,
  NOW() - INTERVAL '12 days'
);

-- Pedido 9: 6 Acevichado Rolls + 10 Gyozas (Completado - hace 6 días)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at)
VALUES (
  1, 2,
  '{"street":"Calle Masaryk 500","city":"Ciudad de México","zip":"11550"}',
  'COMPLETED',
  990.00,
  NOW() - INTERVAL '6 days'
);

-- Pedido 10: 15 Edamames + 3 Dragon Rolls (Completado - hace 2 días)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at)
VALUES (
  1, 2,
  '{"street":"Av. Ejército Nacional 800","city":"Ciudad de México","zip":"11560"}',
  'COMPLETED',
  540.00,
  NOW() - INTERVAL '2 days'
);

-- Pedido 11: CANCELADO - 5 Philadelphia Rolls (No debe contar)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at)
VALUES (
  1, 2,
  '{"street":"Av. Polanco 200","city":"Ciudad de México","zip":"11550"}',
  'CANCELED',
  475.00,
  NOW() - INTERVAL '1 day'
);

-- =============================================
-- 13.4 ORDER_ITEMS PARA SUSHI GARDEN
-- =============================================

-- Pedido 8 (order_id = 8)
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase) VALUES
(8, 8, 8, 95.00),   -- Philadelphia Roll
(8, 9, 4, 150.00);  -- Dragon Roll Especial

-- Pedido 9 (order_id = 9)
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase) VALUES
(9, 10, 6, 140.00), -- Acevichado Roll
(9, 11, 10, 75.00); -- Gyozas de Cerdo

-- Pedido 10 (order_id = 10)
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase) VALUES
(10, 12, 15, 60.00), -- Edamames al vapor
(10, 9, 3, 150.00);  -- Dragon Roll Especial

-- Pedido 11 (order_id = 11) - CANCELADO
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase) VALUES
(11, 8, 5, 95.00);   -- Philadelphia Roll

-- =============================================
-- 13.5 AGREGAR PAGOS DE PRUEBA
-- =============================================

INSERT INTO payments (order_id, payment_method, status, transaction_id, created_at) VALUES
(1, 'CARD', 'SUCCESS', 'TXN1001', NOW() - INTERVAL '15 days'),
(2, 'CASH', 'SUCCESS', NULL, NOW() - INTERVAL '10 days'),
(3, 'CARD', 'SUCCESS', 'TXN1002', NOW() - INTERVAL '8 days'),
(4, 'CARD', 'SUCCESS', 'TXN1003', NOW() - INTERVAL '5 days'),
(5, 'CASH', 'SUCCESS', NULL, NOW() - INTERVAL '3 days'),
(6, 'CARD', 'FAILED', 'TXN1004', NOW() - INTERVAL '2 days'),
(7, 'CARD', 'SUCCESS', 'TXN1005', NOW()),
(8, 'CARD', 'SUCCESS', 'TXN1006', NOW() - INTERVAL '12 days'),
(9, 'CASH', 'SUCCESS', NULL, NOW() - INTERVAL '6 days'),
(10, 'CARD', 'SUCCESS', 'TXN1007', NOW() - INTERVAL '2 days'),
(11, 'CARD', 'FAILED', 'TXN1008', NOW() - INTERVAL '1 day');

-- =============================================
-- 14. DISPONIBILIDAD DE PRODUCTOS (US020)
-- =============================================

-- Disponibilidad para La Parrilla Mixteca (restaurant_id = 1)

-- Hamburguesa Clásica (product_id = 1)
-- Disponible de lunes a viernes de 12:00 a 22:00, sábados y domingos de 13:00 a 23:00
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time)
VALUES
((SELECT id FROM products WHERE name = 'Hamburguesa Clásica' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1)), 1, '12:00', '22:00'),
((SELECT id FROM products WHERE name = 'Hamburguesa Clásica' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1)), 2, '12:00', '22:00'),
((SELECT id FROM products WHERE name = 'Hamburguesa Clásica' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1)), 3, '12:00', '22:00'),
((SELECT id FROM products WHERE name = 'Hamburguesa Clásica' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1)), 4, '12:00', '22:00'),
((SELECT id FROM products WHERE name = 'Hamburguesa Clásica' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1)), 5, '12:00', '22:00'),
((SELECT id FROM products WHERE name = 'Hamburguesa Clásica' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1)), 6, '13:00', '23:00'),
((SELECT id FROM products WHERE name = 'Hamburguesa Clásica' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1)), 0, '13:00', '23:00');

-- Hamburguesa BBQ Bacon (product_id = 2)
-- Sólo fines de semana: sábado y domingo de 14:00 a 00:00
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time)
VALUES
((SELECT id FROM products WHERE name = 'Hamburguesa BBQ Bacon' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1)), 6, '14:00', '00:00'),
((SELECT id FROM products WHERE name = 'Hamburguesa BBQ Bacon' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1)), 0, '14:00', '00:00');

-- Agua de Jamaica (product_id = 4)
-- Disponible todos los días de 10:00 a 20:00
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time)
SELECT id, day, '10:00', '20:00'
FROM products
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS days(day)
WHERE name = 'Agua de Jamaica 500ml' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1);

-- Papas Gajo Sazonadas (product_id = 6)
-- Solo lunes, miércoles y viernes de 18:00 a 22:00
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time)
VALUES
((SELECT id FROM products WHERE name = 'Papas Gajo Sazonadas' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1)), 1, '18:00', '22:00'),
((SELECT id FROM products WHERE name = 'Papas Gajo Sazonadas' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1)), 3, '18:00', '22:00'),
((SELECT id FROM products WHERE name = 'Papas Gajo Sazonadas' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 1)), 5, '18:00', '22:00');

-- =============================================
-- Disponibilidad para Sushi Garden (restaurant_id = 2)
-- =============================================

-- Philadelphia Roll (product_id = 8)
-- De lunes a jueves 13:00-22:00, viernes y sábado 13:00-00:00, domingo 13:00-20:00
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time)
VALUES
((SELECT id FROM products WHERE name = 'Philadelphia Roll' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 2)), 1, '13:00', '22:00'),
((SELECT id FROM products WHERE name = 'Philadelphia Roll' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 2)), 2, '13:00', '22:00'),
((SELECT id FROM products WHERE name = 'Philadelphia Roll' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 2)), 3, '13:00', '22:00'),
((SELECT id FROM products WHERE name = 'Philadelphia Roll' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 2)), 4, '13:00', '22:00'),
((SELECT id FROM products WHERE name = 'Philadelphia Roll' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 2)), 5, '13:00', '00:00'),
((SELECT id FROM products WHERE name = 'Philadelphia Roll' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 2)), 6, '13:00', '00:00'),
((SELECT id FROM products WHERE name = 'Philadelphia Roll' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 2)), 0, '13:00', '20:00');

-- Dragon Roll Especial (product_id = 9)
-- Solo los jueves, viernes y sábados de 19:00 a 23:00
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time)
VALUES
((SELECT id FROM products WHERE name = 'Dragon Roll Especial' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 2)), 4, '19:00', '23:00'),
((SELECT id FROM products WHERE name = 'Dragon Roll Especial' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 2)), 5, '19:00', '23:00'),
((SELECT id FROM products WHERE name = 'Dragon Roll Especial' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 2)), 6, '19:00', '23:00');

-- Gyozas de Cerdo (product_id = 11)
-- Todos los días de 12:00 a 21:00, excepto martes (cerrado)
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time)
SELECT id, day, '12:00', '21:00'
FROM products
CROSS JOIN (VALUES (0),(1),(3),(4),(5),(6)) AS days(day)   -- excluimos martes (2)
WHERE name = 'Gyozas de Cerdo (5 pzs)' AND category_id IN (SELECT id FROM categories WHERE restaurant_id = 2);

-- =============================================
-- GENERAR PREFERENCIAS DESDE HISTORIAL
-- =============================================

INSERT INTO customer_product_preferences (
    customer_id,
    product_id,
    order_count,
    last_ordered_at,
    score,
    updated_at
)
SELECT 
    o.customer_id,
    oi.product_id,
    SUM(oi.quantity) AS order_count,
    MAX(o.created_at) AS last_ordered_at,

    -- score simple (puedes mejorar luego)
    SUM(oi.quantity) * 1.0 AS score,

    NOW()
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'COMPLETED'
GROUP BY o.customer_id, oi.product_id
ON CONFLICT (customer_id, product_id)
DO UPDATE SET
    order_count = EXCLUDED.order_count,
    last_ordered_at = EXCLUDED.last_ordered_at,
    score = EXCLUDED.score,
    updated_at = NOW();

-- =============================================
-- GENERAR RECOMENDACIONES
-- =============================================

DELETE FROM customer_recommendations;

INSERT INTO customer_recommendations (
    customer_id,
    product_id,
    score,
    rank,
    created_at
)
SELECT 
    customer_id,
    product_id,
    score,
    ROW_NUMBER() OVER (
        PARTITION BY customer_id 
        ORDER BY score DESC
    ) AS rank,
    NOW()
FROM customer_product_preferences;