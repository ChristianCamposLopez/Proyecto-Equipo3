-- =============================================
-- PROYECTO: SISTEMA DE PEDIDOS PARA RESTAURANTES
-- EQUIPO: No. 3
-- DESCRIPCIÓN: Script Único de Persistencia (Sprint 4)
-- =============================================

--RESTAURAND_ID: Siempre sera 1 ya que ahora no se maneja un sistema multi-tenant, pero se deja la estructura para futuras expansiones.


-- 1. LIMPIEZA DE TABLAS
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
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
DROP TABLE IF EXISTS delivery_addresses CASCADE;
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

CREATE TABLE delivery_addresses (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    street VARCHAR(150) NOT NULL,
    exterior_number VARCHAR(20) NOT NULL,
    interior_number VARCHAR(20),
    neighborhood VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    delivery_references VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT delivery_addresses_postal_code_chk CHECK (postal_code ~ '^[0-9]{5}$')
);

CREATE INDEX delivery_addresses_customer_idx
ON delivery_addresses(customer_id);

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
    is_available BOOLEAN DEFAULT TRUE,
    -- Nota: activacion y desactivacion del plato IVAN SANCHEZ MORALES
    is_active BOOLEAN DEFAULT TRUE,
    stock INT NOT NULL DEFAULT 10 CHECK (stock >= 0),
    -- Nota: eliminación lógica del plato (US005.3) IVAN SANCHEZ MORALES
    deleted_at TIMESTAMP NULL,
    -- columnas añadidas para US009: gestión de imágenes
    image_url VARCHAR(500),
    image_uploaded_at TIMESTAMP,
    CONSTRAINT products_stock_availability_chk
      CHECK (
        (stock = 0 AND is_available = FALSE)
        OR
        (stock > 0 AND is_available = TRUE)
      )
);

-- =============================================
-- 6. IMÁGENES DE PRODUCTOS (US009)
-- =============================================
--Nota: Esta es de mi version de imagenes que soporta multiples imagenes por producto YA QUE SE REPITIERON ASIGNACION DE HISTORIAS.
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
--Nota: Tabla para definir en qué días y horarios específicos está disponible cada producto.
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

-- 5. MÓDULO DE FRAY: CARRITO DE COMPRAS
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES users(id),
    restaurant_id INT REFERENCES restaurants(id),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT carts_status_chk CHECK (status IN ('ACTIVE', 'CHECKED_OUT', 'ABANDONED'))
);

CREATE UNIQUE INDEX carts_one_active_per_customer_idx
ON carts(customer_id)
WHERE status = 'ACTIVE';

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT cart_items_unique_product_per_cart UNIQUE (cart_id, product_id)
);

-- 6. MÓDULO DE IRVING: PEDIDOS Y COCINA
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id),
    restaurant_id INT REFERENCES restaurants(id),
    delivery_address_json JSONB,
    deliveryman_id INT REFERENCES users(id), -- US012: repartidor asignado
    status VARCHAR(50) DEFAULT 'PENDING', -- Irving: PENDING, PREPARING, READY, DELIVERY_ASSIGNED
    note VARCHAR(200), -- US007: notas especiales del cliente para cocina
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW() ,-- Irving: Base para temporizador
    confirmed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price_at_purchase DECIMAL(10,2)
);

--Nota: Esta tabla es para las historias de usario de recomendacion, cancelacion y rembolsos ya que la orden desaparece por parte de crhistian en la historia de dasboard chef
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

--Nota: Esta tabla es para las historias de usario de recomendacion, cancelacion y rembolsos ya que la orden desaparece por parte de crhistian en la historia de dasboard chef
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


CREATE INDEX idx_orders_customer_status 
ON orders(customer_id, status);

CREATE INDEX idx_order_items_product 
ON order_items(product_id); 

/*
-- 6. MÓDULO DE CHRISTIAN: PAGOS DIGITALES 
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id), -- Christian: Trazabilidad
    payment_method VARCHAR(50), -- 'CARD', 'CASH'
    status VARCHAR(50) DEFAULT 'PENDING', -- 'SUCCESS', 'FAILED'
    transaction_id VARCHAR(100), -- ID de pasarela externa
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6.1 REEMBOLSOS (US026)
CREATE TABLE refunds (
    id SERIAL PRIMARY KEY,
    payment_id INT REFERENCES payments(id),
    amount DECIMAL(10,2),
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
*/


-- ======================================================
-- SEED MODIFICADO PARA PRUEBAS INTEGRALES DE LA BD
-- SIN IMÁGENES Y CON HISTORIAL DE PEDIDOS
-- ======================================================

-- ======================================================
-- SEED CON UN SOLO RESTAURANTE (Tacos El Buen Sabor)
-- SIN IMÁGENES Y CON HISTORIAL DE PEDIDOS
-- ======================================================
-- ======================================================
-- SEED CORREGIDO - CASTING DE NULL A TIMESTAMP
-- UN SOLO RESTAURANTE, SIN IMÁGENES
-- ======================================================

-- 2. ROLES
INSERT INTO roles (name, permisos) VALUES
('client', '{"ver_menu","hacer_pedido","ver_historial"}'),
('restaurant_admin', '{"gestionar_restaurante","gestionar_menu","ver_reportes"}'),
('chef', '{"ver_pedidos_pendientes","actualizar_estado_cocina"}'),
('repartidor', '{"ver_pedidos_asignados","actualizar_entrega"}');

-- 3. USUARIOS todas son hash_admin
WITH inserted_users AS (
    INSERT INTO users (email, password_hash, full_name, phone_number, reset_token, token_expiracion)
    VALUES
        ('cliente1@test.com', '$2a$10$FjsdCV80U./ghLrSBmawOuOA/ji5spI2ykmNI/geI2xizBx3vAC7a', 'Carlos López', '5512345678', NULL, NULL),
        ('cliente2@test.com', '$2a$10$FjsdCV80U./ghLrSBmawOuOA/ji5spI2ykmNI/geI2xizBx3vAC7a', 'María García', '5512345679', NULL, NULL),
        ('admin_rest@test.com', '$2a$10$FjsdCV80U./ghLrSBmawOuOA/ji5spI2ykmNI/geI2xizBx3vAC7a', 'Javier Martínez', '5512345680', NULL, NULL),
        ('chef1@test.com', '$2a$10$FjsdCV80U./ghLrSBmawOuOA/ji5spI2ykmNI/geI2xizBx3vAC7a', 'Ana Rodríguez', '5512345681', NULL, NULL),
        ('repartidor1@test.com', '$2a$10$FjsdCV80U./ghLrSBmawOuOA/ji5spI2ykmNI/geI2xizBx3vAC7a', 'Luis Fernández', '5512345682', NULL, NULL),
        ('repartidor2@test.com', '$2a$10$FjsdCV80U./ghLrSBmawOuOA/ji5spI2ykmNI/geI2xizBx3vAC7a', 'Elena Torres', '5512345683', NULL, NULL),
        ('cliente_inactivo@test.com', '$2a$10$FjsdCV80U./ghLrSBmawOuOA/ji5spI2ykmNI/geI2xizBx3vAC7a', 'Pedro Infante', '5512345684', NULL, NULL)
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
   OR (u.email = 'admin_rest@test.com' AND r.name = 'restaurant_admin')
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

-- 5. UN SOLO RESTAURANTE
INSERT INTO restaurants (owner_user_id, name, latitude, longitude, tax_id, is_active)
SELECT u.id, 'Tacos El Buen Sabor', 19.432608, -99.133209, 'TAX123456', true
FROM users u WHERE u.email = 'admin_rest@test.com';

-- 6. HORARIOS DEL RESTAURANTE (CON CASTING EXPLÍCITO)
WITH rest AS (SELECT id FROM restaurants WHERE name = 'Tacos El Buen Sabor')
INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time)
SELECT r.id, 1, '10:00:00'::time, '22:00:00'::time FROM rest r
UNION ALL SELECT r.id, 2, '10:00:00'::time, '22:00:00'::time FROM rest r
UNION ALL SELECT r.id, 3, '10:00:00'::time, '22:00:00'::time FROM rest r
UNION ALL SELECT r.id, 4, '10:00:00'::time, '22:00:00'::time FROM rest r
UNION ALL SELECT r.id, 5, '10:00:00'::time, '23:00:00'::time FROM rest r
UNION ALL SELECT r.id, 6, '12:00:00'::time, '00:00:00'::time FROM rest r
UNION ALL SELECT r.id, 0, '12:00:00'::time, '20:00:00'::time FROM rest r;

-- 7. CATEGORÍAS
INSERT INTO categories (restaurant_id, name, descripcion)
SELECT r.id, 'Tacos', 'Tacos de diversos guisos' FROM restaurants r WHERE r.name = 'Tacos El Buen Sabor'
UNION ALL
SELECT r.id, 'Bebidas', 'Refrescos, aguas frescas' FROM restaurants r WHERE r.name = 'Tacos El Buen Sabor'
UNION ALL
SELECT r.id, 'Postres', 'Postres caseros' FROM restaurants r WHERE r.name = 'Tacos El Buen Sabor';

-- 8. PRODUCTOS (con NULL::timestamp para coincidir con NOW())
WITH cats AS (
    SELECT c.id, c.name, r.name as rest_name
    FROM categories c JOIN restaurants r ON c.restaurant_id = r.id
)
INSERT INTO products (category_id, descripcion, name, base_price, is_available, is_active, stock, deleted_at)
SELECT c.id, 'Taco de pastor con piña', 'Taco al pastor', 18.00, true, true, 50, NULL::timestamp
FROM cats c WHERE c.name = 'Tacos' AND c.rest_name = 'Tacos El Buen Sabor'
UNION ALL
SELECT c.id, 'Taco de bistec con cebolla', 'Taco de bistec', 20.00, true, true, 30, NULL::timestamp
FROM cats c WHERE c.name = 'Tacos' AND c.rest_name = 'Tacos El Buen Sabor'
UNION ALL
SELECT c.id, 'Agua de horchata', 'Horchata', 25.00, true, true, 100, NULL::timestamp
FROM cats c WHERE c.name = 'Bebidas' AND c.rest_name = 'Tacos El Buen Sabor'
UNION ALL
-- Producto agotado (stock=0) -> is_available false
SELECT c.id, 'Taco de carnitas (agotado)', 'Carnitas', 22.00, false, true, 0, NULL::timestamp
FROM cats c WHERE c.name = 'Tacos' AND c.rest_name = 'Tacos El Buen Sabor'
UNION ALL
-- Producto eliminado lógicamente (deleted_at = NOW())
SELECT c.id, 'Taco de lengua (descontinuado)', 'Lengua', 25.00, false, false, 0, NOW()
FROM cats c WHERE c.name = 'Tacos' AND c.rest_name = 'Tacos El Buen Sabor'
UNION ALL
-- Postre
SELECT c.id, 'Flan napolitano', 'Flan', 35.00, true, true, 20, NULL::timestamp
FROM cats c WHERE c.name = 'Postres' AND c.rest_name = 'Tacos El Buen Sabor';

-- 9. DISPONIBILIDAD DE PRODUCTOS (CON CASTING)
WITH pastor AS (SELECT id FROM products WHERE name = 'Taco al pastor')
INSERT INTO product_availability (product_id, day_of_week, start_time, end_time)
SELECT id, 1, '13:00:00'::time, '17:00:00'::time FROM pastor
UNION ALL SELECT id, 2, '13:00:00'::time, '17:00:00'::time FROM pastor
UNION ALL SELECT id, 3, '13:00:00'::time, '17:00:00'::time FROM pastor
UNION ALL SELECT id, 4, '13:00:00'::time, '17:00:00'::time FROM pastor
UNION ALL SELECT id, 5, '13:00:00'::time, '18:00:00'::time FROM pastor;

-- 10. GRUPOS DE OPCIONES
WITH rest_tacos AS (SELECT id FROM restaurants WHERE name = 'Tacos El Buen Sabor')
INSERT INTO option_groups (restaurant_id, name, min_selection, max_selection)
SELECT id, 'Tamaño de taco', 1, 1 FROM rest_tacos
UNION ALL
SELECT id, 'Salsas extra', 0, 3 FROM rest_tacos;

-- Asociar grupos a productos
WITH 
    taco AS (SELECT id FROM products WHERE name = 'Taco al pastor'),
    grupo_tamano AS (SELECT og.id FROM option_groups og JOIN restaurants r ON og.restaurant_id = r.id WHERE r.name = 'Tacos El Buen Sabor' AND og.name = 'Tamaño de taco'),
    grupo_salsas AS (SELECT og.id FROM option_groups og JOIN restaurants r ON og.restaurant_id = r.id WHERE r.name = 'Tacos El Buen Sabor' AND og.name = 'Salsas extra')
INSERT INTO product_option_groups (product_id, option_group_id)
SELECT t.id, gt.id FROM taco t, grupo_tamano gt
UNION ALL
SELECT t.id, gs.id FROM taco t, grupo_salsas gs;

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
SELECT og.id, 'Salsa de aguacate', 5.00 FROM option_groups og WHERE og.name = 'Salsas extra';

-- 11. CARRITOS
WITH cliente1 AS (SELECT id FROM users WHERE email = 'cliente1@test.com'),
     rest1 AS (SELECT id FROM restaurants WHERE name = 'Tacos El Buen Sabor')
INSERT INTO carts (customer_id, restaurant_id, status)
SELECT c.id, r.id, 'CHECKED_OUT' FROM cliente1 c, rest1 r;

WITH cliente2 AS (SELECT id FROM users WHERE email = 'cliente2@test.com'),
     rest2 AS (SELECT id FROM restaurants WHERE name = 'Tacos El Buen Sabor')
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

-- 13. PEDIDOS EN orders
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

-- Pedido 2: PREPARING (con repartidor)
WITH cliente2 AS (SELECT id FROM users WHERE email = 'cliente2@test.com'),
     rest_taco AS (SELECT id FROM restaurants WHERE name = 'Tacos El Buen Sabor'),
     repartidor AS (SELECT id FROM users WHERE email = 'repartidor1@test.com'),
     dir_cliente2 AS (SELECT street, exterior_number, neighborhood, city, state, postal_code, delivery_references 
                      FROM delivery_addresses WHERE customer_id = (SELECT id FROM users WHERE email = 'cliente2@test.com') LIMIT 1)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, deliveryman_id, status, note, total_amount)
SELECT c.id, r.id, 
       jsonb_build_object('street', d.street, 'ext_num', d.exterior_number, 'neighborhood', d.neighborhood, 
                          'city', d.city, 'state', d.state, 'postal_code', d.postal_code, 'references', d.delivery_references),
       rep.id, 'PREPARING', 'Mucha salsa', 130.00
FROM cliente2 c, rest_taco r, repartidor rep, dir_cliente2 d;

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
     rest_taco AS (SELECT id FROM restaurants WHERE name = 'Tacos El Buen Sabor'),
     repartidor2 AS (SELECT id FROM users WHERE email = 'repartidor2@test.com'),
     dir_inactivo AS (SELECT street, exterior_number, neighborhood, city, state, postal_code, delivery_references 
                      FROM delivery_addresses WHERE customer_id = (SELECT id FROM users WHERE email = 'cliente_inactivo@test.com') LIMIT 1)
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, deliveryman_id, status, note, total_amount)
SELECT c.id, r.id, 
       jsonb_build_object('street', d.street, 'ext_num', d.exterior_number, 'neighborhood', d.neighborhood, 
                          'city', d.city, 'state', d.state, 'postal_code', d.postal_code, 'references', d.delivery_references),
       rep.id, 'DELIVERY_ASSIGNED', 'Entregar en departamento 3B', 220.00
FROM cliente_inactivo c, rest_taco r, repartidor2 rep, dir_inactivo d;

-- 14. DETALLES DE PEDIDOS (order_items) y opciones
-- Pedido 1: 2 tacos al pastor, 1 horchata
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

-- Pedido 2: 2 tacos de bistec y 1 flan
WITH pedido2 AS (SELECT id FROM orders WHERE status = 'PREPARING'),
     prod_bistec AS (SELECT id, base_price FROM products WHERE name = 'Taco de bistec'),
     prod_flan AS (SELECT id, base_price FROM products WHERE name = 'Flan')
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase)
SELECT p.id, pb.id, 2, pb.base_price FROM pedido2 p, prod_bistec pb
UNION ALL
SELECT p.id, pf.id, 1, pf.base_price FROM pedido2 p, prod_flan pf;

-- Opciones para los tacos de bistec (salsa verde)
WITH item_bistec AS (
    SELECT oi.id AS order_item_id, opt.id AS option_id, opt.price_modifier
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products pr ON oi.product_id = pr.id
    JOIN options opt ON opt.name = 'Salsa verde'
    WHERE o.status = 'PREPARING' AND pr.name = 'Taco de bistec'
    LIMIT 1
)
INSERT INTO order_item_options (order_item_id, option_id, price_at_purchase)
SELECT order_item_id, option_id, price_modifier FROM item_bistec;

-- 15. PAGOS Y REEMBOLSOS
-- Pago exitoso para pedido 1
WITH pedido1 AS (SELECT id FROM orders WHERE status = 'PENDING' AND total_amount = 79.00)
INSERT INTO payments (order_id, payment_method, status, transaction_id)
SELECT id, 'CARD', 'SUCCESS', 'txn_123456789' FROM pedido1;

-- Pago fallido para pedido 2
WITH pedido2 AS (SELECT id FROM orders WHERE status = 'PREPARING')
INSERT INTO payments (order_id, payment_method, status, transaction_id)
SELECT id, 'CARD', 'FAILED', 'txn_failed_001' FROM pedido2;

-- Reembolso asociado al pago fallido
WITH pago_fallido AS (SELECT id FROM payments WHERE transaction_id = 'txn_failed_001')
INSERT INTO refunds (payment_id, amount, reason)
SELECT id, 130.00, 'Fallo en el cobro, se reembolsa el monto completo' FROM pago_fallido;

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
     rest_taco AS (SELECT id FROM restaurants WHERE name = 'Tacos El Buen Sabor')
INSERT INTO pedido_historial (customer_id, restaurant_id, delivery_address_json, status, total_amount, refund_rejection_reason)
SELECT c.id, r.id, 
       jsonb_build_object('street', 'Av. Siempre Viva', 'city', 'Guadalajara'),
       'COMPLETED', 520.00, NULL
FROM cliente2 c, rest_taco r;

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
WHERE u.email = 'cliente1@test.com' AND r.name = 'Tacos El Buen Sabor';

-- Items para el pedido cancelado
WITH hist_cancelado AS (SELECT id FROM pedido_historial WHERE status = 'CANCELLED' LIMIT 1),
     prod_pastor AS (SELECT id, base_price FROM products WHERE name = 'Taco al pastor')
INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
SELECT h.id, p.id, 2, p.base_price FROM hist_cancelado h, prod_pastor p;

-- Items para el pedido completado
WITH hist_completado AS (SELECT id FROM pedido_historial WHERE status = 'COMPLETED' LIMIT 1),
     prod_bistec AS (SELECT id, base_price FROM products WHERE name = 'Taco de bistec'),
     prod_horchata AS (SELECT id, base_price FROM products WHERE name = 'Horchata')
INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
SELECT h.id, p.id, 3, p.base_price FROM hist_completado h, prod_bistec p
UNION ALL
SELECT h.id, ph.id, 2, ph.base_price FROM hist_completado h, prod_horchata ph;

-- Items para el pedido reembolsado
WITH hist_refunded AS (SELECT id FROM pedido_historial WHERE status = 'REFUNDED' LIMIT 1),
     prod_flan AS (SELECT id, base_price FROM products WHERE name = 'Flan')
INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
SELECT h.id, p.id, 2, p.base_price FROM hist_refunded h, prod_flan p;

-- Items para el pedido con reembolso rechazado
WITH hist_rejected AS (SELECT id FROM pedido_historial WHERE status = 'REFUND_REJECTED' LIMIT 1),
     prod_carnitas AS (SELECT id, base_price FROM products WHERE name = 'Carnitas')
INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
SELECT h.id, p.id, 1, p.base_price FROM hist_rejected h, prod_carnitas p;

