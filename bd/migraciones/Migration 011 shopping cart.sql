CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES users(id),
    restaurant_id INT REFERENCES restaurants(id),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT carts_status_chk CHECK (status IN ('ACTIVE', 'CHECKED_OUT', 'ABANDONED'))
);

CREATE UNIQUE INDEX IF NOT EXISTS carts_one_active_per_customer_idx
ON carts(customer_id)
WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT cart_items_unique_product_per_cart UNIQUE (cart_id, product_id)
);

INSERT INTO carts (customer_id, restaurant_id, status)
SELECT 1, 1, 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1
    FROM carts
    WHERE customer_id = 1 AND status = 'ACTIVE'
);

INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
SELECT c.id, 1, 1, 85.00
FROM carts c
WHERE c.customer_id = 1
  AND c.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM cart_items ci
      WHERE ci.cart_id = c.id
        AND ci.product_id = 1
  );
