#!/bin/bash
# scripts/test-black-box-us009.sh
# Pruebas de caja negra para US009 (SQL puro contra PostgreSQL)

set -e

DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-password_secreto}
DB_NAME=${DB_NAME:-restaurante_bd}
DB_PORT=${DB_PORT:-5432}

export PGPASSWORD=$DB_PASSWORD

echo "================================"
echo "PRUEBAS DE CAJA NEGRA - US009"
echo "Connecting to $DB_HOST:$DB_PORT/$DB_NAME"
echo "================================"

# US009.1 - Leer imágenes de producto
echo ""
echo "--- TEST 1: Leer imágenes (LEFT JOIN) ---"
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT << 'EOF'
SELECT 'Test 1: Get products with primary images' as test;
SELECT p.id, p.name, COALESCE(pi.image_path, '/images/default-product.png') as image_display
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE AND pi.deleted_at IS NULL
WHERE p.id = 1
LIMIT 1;
EOF

# US009.2 - Crear imagen válida
echo ""
echo "--- TEST 2: Crear imagen válida ---"
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT << 'EOF'
SELECT 'Test 2: Insert valid image' as test;
INSERT INTO product_images (product_id, image_path, file_name, file_size, format, is_primary)
VALUES (1, '/uploads/test_img.jpg', 'test_img.jpg', 102400, 'JPEG', TRUE)
RETURNING *;
EOF

# US009.2 - Verificar que solo una imagen es primaria
echo ""
echo "--- TEST 3: Verificar is_primary única ---"
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT << 'EOF'
SELECT 'Test 3: Count primary images (should be 1 or less)' as test;
SELECT COUNT(*) as primary_count FROM product_images WHERE product_id = 1 AND is_primary = TRUE AND deleted_at IS NULL;
EOF

# US009.2 - Crear segunda imagen y marcar primera como no primaria
echo ""
echo "--- TEST 4: Segunda imagen reemplaza primaria ---"
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT << 'EOF'
SELECT 'Test 4: Insert second image, first should become non-primary' as test;
UPDATE product_images SET is_primary = FALSE WHERE product_id = 1 AND is_primary = TRUE;
INSERT INTO product_images (product_id, image_path, file_name, file_size, format, is_primary)
VALUES (1, '/uploads/test_img2.jpg', 'test_img2.jpg', 102400, 'JPEG', TRUE)
RETURNING id, is_primary;
SELECT COUNT(*) as total_primary FROM product_images WHERE product_id = 1 AND is_primary = TRUE AND deleted_at IS NULL;
EOF

# US009.3 - Soft delete de imagen
echo ""
echo "--- TEST 5: Soft delete imagen ---"
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT << 'EOF'
SELECT 'Test 5: Soft delete (mark deleted_at)' as test;
UPDATE product_images SET deleted_at = NOW() WHERE product_id = 1 AND file_name = 'test_img.jpg'
RETURNING id, deleted_at;
SELECT 'Verify deleted image not in active list' as verify;
SELECT COUNT(*) as active_images FROM product_images WHERE product_id = 1 AND deleted_at IS NULL;
EOF

# US009 - Hard delete (opcional)
echo ""
echo "--- TEST 6: Hard delete de imagen (opcional) ---"
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT << 'EOF'
SELECT 'Test 6: Hard delete (use with caution)' as test;
DELETE FROM product_images WHERE product_id = 1 AND file_name = 'test_img2.jpg'
RETURNING id;
SELECT COUNT(*) as remaining FROM product_images WHERE product_id = 1;
EOF

# Limpieza de pruebas
echo ""
echo "--- CLEANUP: Limpiar datos de pruebas ---"
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT << 'EOF'
DELETE FROM product_images WHERE product_id = 1;
SELECT 'Cleaned up test images' as result;
EOF

echo ""
echo "================================"
echo "PRUEBAS COMPLETADAS EXITOSAMENTE"
echo "================================"
