-- =============================================
-- PROYECTO: SISTEMA DE PEDIDOS PARA RESTAURANTES
-- EQUIPO: No. 3
-- DESCRIPCIÓN: Script Único de Persistencia (Sprint 4)
-- =============================================

--RESTAURAND_ID: Siempre sera 1 ya que ahora no se maneja un sistema multi-tenant, pero se deja la estructura para futuras expansiones.


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
DROP TABLE IF EXISTS review CASCADE;

-- 2. INFRAESTRUCTURA DE USUARIOS Y ROLES (Seguridad)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    reset_token VARCHAR(255),
    token_expiracion TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE, -- 'client', 'restaurant_admin', 'chef', 'repartidor'
    permisos TEXT -- permisos asociados al rol (US010.4)
);

CREATE TABLE user_roles (
    user_id INT REFERENCES users(id),
    role_id INT REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- 3. RESTAURANTES Y HORARIOS
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    owner_user_id INT REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    tax_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE restaurant_hours (
    id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id),
    day_of_week INT, -- 0=Domingo, 1=Lunes...
    open_time TIME,
    close_time TIME
);

-- 4. MÓDULO DE IVAN Y MARIO: CATÁLOGO Y GESTIÓN DE MENÚ
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

    CONSTRAINT chk_order_status CHECK (status IN ('PENDING' , 'CONFIRMED' , 'PREPARING' , 'READY'))
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,

    order_id INT REFERENCES orders(id),

    product_id INT REFERENCES products(id),

    quantity INT NOT NULL,

    -- preserva precio histórico
    unit_price_at_purchase DECIMAL(10,2)
);

CREATE TABLE pedido_historial (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id),
    restaurant_id INT REFERENCES restaurants(id),

    delivery_address_json JSONB,

    status VARCHAR(50) DEFAULT 'PENDING',

    total_amount DECIMAL(10,2),

    created_at TIMESTAMP DEFAULT NOW(),

    refund_rejection_reason TEXT,

    CONSTRAINT chk_order_status CHECK (status IN ('CANCELLED', 'COMPLETED', 'PENDING', 'REFUNDED', 'REFUND_REJECTED')) -- SOLO PEDIDOS FINALIZADOS O CANCELADOS PARA HISTORIAL
);

CREATE TABLE pedido_items_historial (
    id SERIAL PRIMARY KEY,

    order_id INT REFERENCES pedido_historial(id), -- 🔥 CAMBIO AQUÍ

    product_id INT REFERENCES products(id),

    quantity INT NOT NULL,
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
    order_id INT REFERENCES pedido_historial(id), -- 🔥 CAMBIO POR QUE LA TABLA ORDER ES TEMPORAL SEGUN CHRISTIAN Y NO SE SI LOS PAGOS SE MANTIENEN DE FORMA PERMANENTE?
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

/*
CREATE INDEX idx_preferences_customer 
ON customer_product_preferences(customer_id);

CREATE INDEX idx_recommendations_customer 
ON customer_recommendations(customer_id);

*/
-- =============================================
-- 12. SEEDING (SOLO RESTAURANTE 1)
-- =============================================

-- =============================================
-- LIMPIEZA PREVIA (opcional, solo si quieres reiniciar)
-- =============================================
-- TRUNCATE TABLE order_items, pedido_items_historial, orders, pedido_historial, payments, product_availability, products, categories, restaurants, user_roles, users, roles RESTART IDENTITY CASCADE;

-- =============================================
-- 1. ROLES
-- =============================================
INSERT INTO roles (name) VALUES ('client'), ('restaurant_admin'), ('chef');

-- =============================================
-- 2. USUARIOS
-- =============================================
INSERT INTO users (email, full_name, phone_number)
VALUES
('cliente@ejemplo.com', 'Juan Pérez', '5551234567'),
('admin@restaurante.com', 'Carlos Admin', '5559876543');

-- Asignar roles
INSERT INTO user_roles VALUES (1,1), (2,2);

-- =============================================
-- 3. RESTAURANTE
-- =============================================
INSERT INTO restaurants (owner_user_id, name) VALUES (2, 'La Parrilla Mixteca');

-- =============================================
-- 4. CATEGORÍAS
-- =============================================
INSERT INTO categories (restaurant_id, name, descripcion) VALUES
(1, 'Hamburguesas', 'Especialidades al carbón'),
(1, 'Bebidas', 'Refrescos y aguas naturales'),
(1, 'Complementos', 'Papas y aros de cebolla');

-- =============================================
-- 5. PRODUCTOS (con stock e is_active)
-- =============================================
INSERT INTO products (category_id, name, base_price, stock, is_active) VALUES
(1, 'Hamburguesa Clásica', 85.00, 20, true),
(1, 'Hamburguesa BBQ Bacon', 110.00, 15, true),
(1, 'Hamburguesa Doble Queso', 135.00, 10, true),
(2, 'Agua de Jamaica 500ml', 25.00, 50, true),
(2, 'Refresco Cola 500ml', 30.00, 100, true),
(3, 'Papas Gajo Sazonadas', 45.00, 30, true),
(3, 'Aros de Cebolla (8 pzs)', 55.00, 20, true);

-- =============================================
-- 6. DISPONIBILIDAD DE PRODUCTOS (usando IDs directos)
-- =============================================
-- Hamburguesa Clásica (id=1): Lunes a Domingo, horarios variados
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time) VALUES
(1, 1, '12:00', '22:00'), (1, 2, '12:00', '22:00'), (1, 3, '12:00', '22:00'),
(1, 4, '12:00', '22:00'), (1, 5, '12:00', '22:00'), (1, 6, '13:00', '23:00'),
(1, 0, '13:00', '23:00');

-- Hamburguesa BBQ Bacon (id=2): Sábado y domingo
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time) VALUES
(2, 6, '14:00', '00:00'), (2, 0, '14:00', '00:00');

-- Agua de Jamaica (id=4): Todos los días 10:00-20:00
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time)
SELECT 4, day, '10:00', '20:00' FROM (VALUES (0),(1),(2),(3),(4),(5),(6)) AS days(day);

-- Papas Gajo (id=6): Lunes, miércoles, viernes 18:00-22:00
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time) VALUES
(6, 1, '18:00', '22:00'), (6, 3, '18:00', '22:00'), (6, 5, '18:00', '22:00');

-- =============================================
-- 7. PEDIDOS (historial + activos)
-- =============================================

-- -------------------------------------------------
-- Pedido activo (PENDING) para que el cliente pueda cancelar
-- Se inserta en orders, pedido_historial, order_items y pedido_items_historial
-- -------------------------------------------------
INSERT INTO pedido_historial (id, customer_id, restaurant_id, status, total_amount, created_at)
VALUES (100, 1, 1, 'PENDING', 195.00, NOW());

INSERT INTO orders (id, customer_id, restaurant_id, status, total_amount)
VALUES (100, 1, 1, 'PREPARING', 195.00);

-- Items: 1 Hamburguesa Clásica (85) + 1 Refresco (30) + 1 Papas Gajo (45) = 160? No, da 160. Pero el total es 195, así que agregamos otro item: 1 Aros de Cebolla (55) → 85+30+45+55=215. Ajustamos: mejor 2 Hamburguesas Clásicas (170) + 1 Refresco (30) = 200. Dejamos 195? Podemos ajustar: 1 Hamburguesa Clásica (85) + 1 Hamburguesa BBQ (110) = 195. Sí.
INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
VALUES (100, 1, 1, 85.00), (100, 2, 1, 110.00);
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase)
VALUES (100, 1, 1, 85.00), (100, 2, 1, 110.00);

-- Pago asociado (aunque pendiente, se registra)
INSERT INTO payments (order_id, payment_method, status, transaction_id, created_at)
VALUES (100, 'CARD', 'PENDING', 'TXN_PEND', NOW());

-- -------------------------------------------------
-- Pedido COMPLETED (finalizado) – solo en historial
-- -------------------------------------------------
INSERT INTO pedido_historial (id, customer_id, restaurant_id, status, total_amount, created_at)
VALUES (101, 1, 1, 'COMPLETED', 425.00, NOW() - INTERVAL '15 days');

INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
VALUES (101, 1, 5, 85.00);

INSERT INTO payments (order_id, payment_method, status, transaction_id, created_at)
VALUES (101, 'CARD', 'SUCCESS', 'TXN101', NOW() - INTERVAL '15 days');

-- -------------------------------------------------
-- Pedido CANCELLED (pendiente de reembolso) – solo historial
-- -------------------------------------------------
INSERT INTO pedido_historial (id, customer_id, restaurant_id, status, total_amount, created_at)
VALUES (102, 1, 1, 'CANCELLED', 390.00, NOW() - INTERVAL '10 days');

INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
VALUES (102, 2, 3, 110.00), (102, 5, 2, 30.00);

INSERT INTO payments (order_id, payment_method, status, transaction_id, created_at)
VALUES (102, 'CASH', 'SUCCESS', NULL, NOW() - INTERVAL '10 days');

-- -------------------------------------------------
-- Pedido REFUNDED (reembolsado) – solo historial
-- -------------------------------------------------
INSERT INTO pedido_historial (id, customer_id, restaurant_id, status, total_amount, created_at)
VALUES (103, 1, 1, 'REFUNDED', 450.00, NOW() - INTERVAL '8 days');

INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
VALUES (103, 3, 2, 135.00), (103, 6, 4, 45.00);

INSERT INTO payments (order_id, payment_method, status, transaction_id, created_at)
VALUES (103, 'CARD', 'SUCCESS', 'TXN103', NOW() - INTERVAL '8 days');

-- -------------------------------------------------
-- Pedido REFUND_REJECTED (reembolso rechazado) con motivo – solo historial
-- -------------------------------------------------
INSERT INTO pedido_historial (id, customer_id, restaurant_id, status, total_amount, created_at, refund_rejection_reason)
VALUES (104, 1, 1, 'REFUND_REJECTED', 490.00, NOW() - INTERVAL '5 days', 'Cancelación fuera del plazo permitido (el pedido ya estaba en preparación)');

INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
VALUES (104, 1, 4, 85.00), (104, 4, 6, 25.00);

INSERT INTO payments (order_id, payment_method, status, transaction_id, created_at)
VALUES (104, 'CARD', 'SUCCESS', 'TXN104', NOW() - INTERVAL '5 days');

-- -------------------------------------------------
-- Otro pedido CANCELLED (pendiente de reembolso) más reciente
-- -------------------------------------------------
INSERT INTO pedido_historial (id, customer_id, restaurant_id, status, total_amount, created_at)
VALUES (105, 1, 1, 'CANCELLED', 255.00, NOW() - INTERVAL '2 days');

INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
VALUES (105, 1, 3, 85.00);

INSERT INTO payments (order_id, payment_method, status, transaction_id, created_at)
VALUES (105, 'CARD', 'FAILED', 'TXN105', NOW() - INTERVAL '2 days');

-- -------------------------------------------------
-- Pedido activo PENDING (otro) para pruebas adicionales
-- -------------------------------------------------
INSERT INTO pedido_historial (id, customer_id, restaurant_id, status, total_amount, created_at)
VALUES (106, 1, 1, 'PENDING', 245.00, NOW());

INSERT INTO orders (id, customer_id, restaurant_id, status, total_amount)
VALUES (106, 1, 1, 'PENDING', 245.00);

INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
VALUES (106, 3, 1, 135.00), (106, 7, 2, 55.00);
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase)
VALUES (106, 3, 1, 135.00), (106, 7, 2, 55.00);

INSERT INTO payments (order_id, payment_method, status, transaction_id, created_at)
VALUES (106, 'CARD', 'PENDING', 'TXN106', NOW());

-- =============================================
-- FIN DEL SEEDING
-- =============================================
/*
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

-- Venta masiva para alterar el ranking dinámico

INSERT INTO pedido_historial (customer_id, restaurant_id, status, total_amount, created_at)
VALUES (1, 1, 'COMPLETED', 2750.00, NOW());


INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
VALUES ((SELECT MAX(id) FROM pedido_historial), 7, 50, 55.00);

*/
