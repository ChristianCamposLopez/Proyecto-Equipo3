ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 10;

UPDATE products
SET stock = CASE
  WHEN is_available = FALSE THEN 0
  WHEN stock <= 0 THEN 10
  ELSE stock
END;

ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_stock_non_negative_chk;

ALTER TABLE products
ADD CONSTRAINT products_stock_non_negative_chk
CHECK (stock >= 0);

ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_stock_availability_chk;

ALTER TABLE products
ADD CONSTRAINT products_stock_availability_chk
CHECK (
  (stock = 0 AND is_available = FALSE)
  OR
  (stock > 0 AND is_available = TRUE)
);
