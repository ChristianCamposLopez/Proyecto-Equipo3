-- =============================================
-- PROYECTO: SISTEMA DE PEDIDOS PARA RESTAURANTES
-- EQUIPO: No. 3
-- DESCRIPCIÓN: Script Único de Persistencia (Sprint 3)
-- Autores: @
-- Fecha: 24/febrero/2026                     
-- =============================================

-- 1. LIMPIEZA DE TABLAS (Evitar conflictos de duplicidad)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_item_options CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_option_groups CASCADE;
DROP TABLE IF EXISTS options CASCADE;
DROP TABLE IF EXISTS option_groups CASCADE;
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
    descripcion TEXT -- Agregado según análisis de Ivan
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL, -- Mario: Validación > 0
    is_available BOOLEAN DEFAULT TRUE -- Mario: Control de Stock
);

-- Complejidad del Menú (Opciones y Extras)
CREATE TABLE option_groups (
    id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id),
    name VARCHAR(100), -- Ej: "Término de carne"
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

-- 5. MÓDULO DE FRAY E IRVING: PEDIDOS Y COCINA
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id),
    restaurant_id INT REFERENCES restaurants(id),
    delivery_address_json JSONB,
    status VARCHAR(50) DEFAULT 'PENDING', -- Irving: PENDING, PREPARING, READY
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW() -- Irving: Base para temporizador
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id), -- Fray: Vínculo de Carrito
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price_at_purchase DECIMAL(10,2) -- Persistencia de precio histórico
);

CREATE TABLE order_item_options (
    id SERIAL PRIMARY KEY,
    order_item_id INT REFERENCES order_items(id),
    option_id INT REFERENCES options(id),
    price_at_purchase DECIMAL(10,2)
);

-- 6. MÓDULO DE CHRISTIAN: PAGOS DIGITALES
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id), -- Christian: Trazabilidad
    payment_method VARCHAR(50), -- 'CARD', 'CASH'
    status VARCHAR(50) DEFAULT 'PENDING', -- 'SUCCESS', 'FAILED'
    transaction_id VARCHAR(100), -- ID de pasarela externa
    created_at TIMESTAMP DEFAULT NOW()
);


-- TABLAS PARA US022 (Promociones)
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- TABLAS PARA US018 (Calificación de experiencia)
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    customer_id INT REFERENCES users(id),
    restaurant_id INT REFERENCES restaurants(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 7. SEMBRADO DE PRUEBA (SEEDING)
-- =============================================

INSERT INTO roles (name, permisos) VALUES 
('client', 'ver_menu,hacer_pedido'),
('restaurant_admin', 'gestionar_pedidos,gestionar_menu,ver_reportes'),
('chef', 'ver_pedidos,actualizar_estado'),
('repartidor', 'ver_entregas,actualizar_entrega');

-- Contraseñas hasheadas con bcrypt (password original: 'password123')
INSERT INTO users (email, password_hash, full_name, phone_number) VALUES 
('cliente@ejemplo.com', '$2a$10$8K1p/a0dR1xqM8K3hKLx3OQx5bY2M5Z9E9V5m6N7o8P9q0R1s2T3u', 'Juan Perez', '5551234567'),
('admin@restaurante.com', '$2a$10$8K1p/a0dR1xqM8K3hKLx3OQx5bY2M5Z9E9V5m6N7o8P9q0R1s2T3u', 'Carlos Admin', '5559876543');

INSERT INTO user_roles VALUES (1, 1), (2, 2);

INSERT INTO restaurants (owner_user_id, name) VALUES (2, 'La Parrilla Mixteca');

INSERT INTO categories (restaurant_id, name, descripcion) 
VALUES (1, 'Hamburguesas', 'Especialidades al carbón');

INSERT INTO products (category_id, name, base_price) 
VALUES (1, 'Hamburguesa Clásica', 85.00);
