-- Insertar categorías faltantes
INSERT INTO categories (restaurant_id, name, descripcion) 
SELECT 1, 'Tacos', 'Tacos variados con ingredientes frescos'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tacos' AND restaurant_id = 1);

INSERT INTO categories (restaurant_id, name, descripcion) 
SELECT 1, 'Pizzas', 'Pizzas artesanales del horno de leña'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Pizzas' AND restaurant_id = 1);

INSERT INTO categories (restaurant_id, name, descripcion) 
SELECT 1, 'Comidas Principales', 'Platos principales y especiales'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Comidas Principales' AND restaurant_id = 1);

INSERT INTO categories (restaurant_id, name, descripcion) 
SELECT 1, 'Bebidas', 'Bebidas frías y calientes'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Bebidas' AND restaurant_id = 1);

INSERT INTO categories (restaurant_id, name, descripcion) 
SELECT 1, 'Postres', 'Deliciosos postres y dulces'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Postres' AND restaurant_id = 1);

INSERT INTO categories (restaurant_id, name, descripcion) 
SELECT 1, 'Ensaladas', 'Ensaladas frescas y saludables'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Ensaladas' AND restaurant_id = 1);

-- Borrar productos existentes para empezar fresh
DELETE FROM products WHERE category_id != 1;

-- Insertar productos (Hamburguesas - categoria 1)
INSERT INTO products (category_id, name, base_price, is_available) VALUES
(1, 'Hamburguesa Clásica', 85.00, true),
(1, 'Hamburguesa BBQ Especial', 120.00, true),
(1, 'Hamburguesa Doble Carne', 145.00, true),
(1, 'Hamburguesa Vegana', 95.00, true),
(1, 'Hamburguesa Queso Azul', 130.00, true);

-- Insertar productos (Tacos)
INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Tacos al Pastor (3 piezas)', 75.00, true FROM categories c WHERE c.name = 'Tacos' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Tacos de Camarón (3 piezas)', 95.00, true FROM categories c WHERE c.name = 'Tacos' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Tacos de Barbacoa (3 piezas)', 80.00, true FROM categories c WHERE c.name = 'Tacos' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Tacos Dorados (3 piezas)', 65.00, true FROM categories c WHERE c.name = 'Tacos' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Tacos de Pescado (3 piezas)', 85.00, true FROM categories c WHERE c.name = 'Tacos' AND c.restaurant_id = 1;

-- Insertar productos (Pizzas)
INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Pizza Margarita', 110.00, true FROM categories c WHERE c.name = 'Pizzas' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Pizza Pepperoni', 120.00, true FROM categories c WHERE c.name = 'Pizzas' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Pizza 4 Quesos', 135.00, true FROM categories c WHERE c.name = 'Pizzas' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Pizza Hawaiana', 125.00, true FROM categories c WHERE c.name = 'Pizzas' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Pizza Vegetariana', 115.00, true FROM categories c WHERE c.name = 'Pizzas' AND c.restaurant_id = 1;

-- Insertar productos (Comidas Principales)
INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Pechuga de Pollo a la Parrilla', 150.00, true FROM categories c WHERE c.name = 'Comidas Principales' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Filete de Res Terminado', 180.00, true FROM categories c WHERE c.name = 'Comidas Principales' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Camarones a la Mantequilla', 160.00, true FROM categories c WHERE c.name = 'Comidas Principales' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Enchiladas Verdes', 120.00, true FROM categories c WHERE c.name = 'Comidas Principales' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Chiles Rellenos', 125.00, true FROM categories c WHERE c.name = 'Comidas Principales' AND c.restaurant_id = 1;

-- Insertar productos (Bebidas)
INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Agua Fresca de Jamaica', 25.00, true FROM categories c WHERE c.name = 'Bebidas' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Limonada Casera', 30.00, true FROM categories c WHERE c.name = 'Bebidas' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Refresco Grande', 35.00, true FROM categories c WHERE c.name = 'Bebidas' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Cerveza Nacional', 45.00, true FROM categories c WHERE c.name = 'Bebidas' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Jugo Natural de Naranja', 40.00, true FROM categories c WHERE c.name = 'Bebidas' AND c.restaurant_id = 1;

-- Insertar productos (Postres)
INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Flan Casero', 50.00, true FROM categories c WHERE c.name = 'Postres' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Pastel de Chocolate', 65.00, true FROM categories c WHERE c.name = 'Postres' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Gelatina de Frutas', 35.00, true FROM categories c WHERE c.name = 'Postres' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Churros con Chocolate', 55.00, true FROM categories c WHERE c.name = 'Postres' AND c.restaurant_id = 1;

INSERT INTO products (category_id, name, base_price, is_available) 
SELECT c.id, 'Tiramisú Italiano', 70.00, true FROM categories c WHERE c.name = 'Postres' AND c.restaurant_id = 1;

-- Verificar inserción
SELECT 'Total de productos' as info, COUNT(*) as cantidad FROM products;
SELECT c.name as categoria, COUNT(p.id) as productos 
FROM categories c 
LEFT JOIN products p ON c.id = p.category_id 
WHERE c.restaurant_id = 1
GROUP BY c.name 
ORDER BY c.name;
