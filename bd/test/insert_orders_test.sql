-- Insertar órdenes de prueba con diferentes estados
INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at)
VALUES
  (1, 1, jsonb_build_object('street', 'Calle Principal 123', 'city', 'Ciudad', 'zip', '12345'), 'PENDING', 250.50, NOW() - INTERVAL '10 minutes'),
  (1, 1, jsonb_build_object('street', 'Calle Principal 123', 'city', 'Ciudad', 'zip', '12345'), 'PENDING', 180.00, NOW() - INTERVAL '5 minutes'),
  (1, 1, jsonb_build_object('street', 'Avenida Secundaria 456', 'city', 'Ciudad', 'zip', '54321'), 'CONFIRMED', 320.75, NOW() - INTERVAL '3 minutes'),
  (1, 1, jsonb_build_object('street', 'Av. Central 789', 'city', 'Ciudad', 'zip', '98765'), 'PREPARING', 150.00, NOW() - INTERVAL '2 minutes'),
  (1, 1, jsonb_build_object('street', 'Calle Principal 123', 'city', 'Ciudad', 'zip', '12345'), 'PENDING', 420.00, NOW() - INTERVAL '1 minute');

-- Insertar items para las órdenes con product_ids existentes
INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase)
VALUES
  (1, 1, 1, 85.00),
  (1, 8, 2, 120.00),
  (1, 9, 1, 145.00),
  (2, 12, 3, 75.00),
  (2, 13, 1, 95.00),
  (3, 1, 2, 85.00),
  (3, 18, 1, 120.00),
  (3, 21, 1, 115.00),
  (4, 17, 2, 110.00),
  (5, 1, 1, 85.00),
  (5, 8, 1, 120.00),
  (5, 19, 2, 135.00),
  (5, 30, 1, 45.00);

SELECT 'Total de órdenes insertadas' as info, COUNT(*) as cantidad FROM orders;
