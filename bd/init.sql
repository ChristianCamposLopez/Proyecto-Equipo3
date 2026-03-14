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

    name VARCHAR(100) NOT NULL,

    base_price DECIMAL(10,2) NOT NULL,

    -- disponibilidad temporal (stock agotado o cocina cerrada)
    is_available BOOLEAN DEFAULT TRUE,

    -- eliminación lógica del plato (US005.3)
    is_active BOOLEAN DEFAULT TRUE,

    -- control de inventario (US005.5)
    stock INTEGER DEFAULT 0
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

    created_at TIMESTAMP DEFAULT NOW()
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

ALTER TABLE products
ADD COLUMN deleted_at TIMESTAMP NULL;

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