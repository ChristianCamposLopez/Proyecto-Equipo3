CREATE TABLE IF NOT EXISTS delivery_addresses (
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

CREATE INDEX IF NOT EXISTS delivery_addresses_customer_idx
ON delivery_addresses(customer_id);

INSERT INTO delivery_addresses (
    customer_id,
    street,
    exterior_number,
    neighborhood,
    city,
    state,
    postal_code,
    delivery_references
)
SELECT
    1,
    'Av. Central',
    '123',
    'Centro',
    'Ciudad',
    'Oaxaca',
    '12345',
    'Casa color blanco'
WHERE NOT EXISTS (
    SELECT 1
    FROM delivery_addresses
    WHERE customer_id = 1
      AND street = 'Av. Central'
      AND exterior_number = '123'
      AND postal_code = '12345'
);
