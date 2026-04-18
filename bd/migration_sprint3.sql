-- =============================================
-- MIGRACIÓN SPRINT 3: US019, US020, US016-017, US004, US008
-- Autores: Equipo 3
-- Fecha: 18/abril/2026
-- =============================================

-- US020: Disponibilidad horaria por producto
CREATE TABLE IF NOT EXISTS product_schedules (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom, 6=Sab
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- US016-017: Reseñas y calificaciones de platillos
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    customer_id INT REFERENCES users(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- SEMBRADO DE DATOS DE PRUEBA
-- =============================================

-- US019: Items de pedidos para ranking (vinculados a orders existentes)
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase) VALUES
    (1, 1, 2, 85.00),   -- Pedido 1: 2x Hamburguesa Clásica
    (1, 4, 1, 20.00),   -- Pedido 1: 1x Agua de Jamaica
    (2, 2, 3, 35.00),   -- Pedido 2: 3x Taco al Pastor
    (2, 3, 1, 40.00),   -- Pedido 2: 1x Taco de Carne Asada
    (2, 5, 1, 40.00);   -- Pedido 2: 1x Cerveza

-- US016: Reseñas de ejemplo
INSERT INTO reviews (product_id, customer_id, rating, comment) VALUES
    (1, 1, 5, 'Excelente hamburguesa, muy jugosa y con ingredientes frescos'),
    (1, 1, 4, 'Buena hamburguesa pero podría tener más queso'),
    (2, 1, 5, 'Los mejores tacos al pastor de la zona, excelente sazón'),
    (3, 1, 3, 'Buen sabor pero la porción es pequeña'),
    (4, 1, 4, 'Muy refrescante, perfecta para el calor'),
    (5, 1, 5, 'Cerveza bien fría, excelente servicio');

-- US020: Horarios de disponibilidad de ejemplo
INSERT INTO product_schedules (product_id, day_of_week, start_time, end_time) VALUES
    (1, 1, '12:00', '22:00'),  -- Hamburguesa: Lunes 12-22
    (1, 2, '12:00', '22:00'),  -- Hamburguesa: Martes 12-22
    (1, 3, '12:00', '22:00'),  -- Hamburguesa: Miércoles 12-22
    (1, 4, '12:00', '22:00'),  -- Hamburguesa: Jueves 12-22
    (1, 5, '12:00', '22:00'),  -- Hamburguesa: Viernes 12-22
    (2, 1, '10:00', '23:00'),  -- Taco al Pastor: Lunes 10-23
    (2, 2, '10:00', '23:00'),  -- Taco al Pastor: Martes 10-23
    (2, 3, '10:00', '23:00'),  -- Taco al Pastor: Miércoles 10-23
    (4, 0, '08:00', '22:00'),  -- Agua Jamaica: Domingo 8-22
    (4, 1, '08:00', '22:00');  -- Agua Jamaica: Lunes 8-22
