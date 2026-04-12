#!/bin/bash

# Script de Pruebas de Persistencia - US012
# Ejecutar: ./scripts/test-persistencia.sh

set -e

echo "🔍 PRUEBAS DE PERSISTENCIA - US012: Asignación de Repartidor"
echo "=============================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para ejecutar query
run_query() {
    local query=$1
    docker-compose exec -T db psql -U postgres -d restaurante_bd << EOF
$query
EOF
}

# Test 1: Estado Inicial
echo -e "${YELLOW}📋 TEST 1: Estado Inicial - Pedidos sin repartidor${NC}"
run_query "
SELECT id, status, deliveryman_id 
FROM orders 
WHERE deliveryman_id IS NULL 
ORDER BY id;
"
echo ""

# Test 2: Integridad Referencial
echo -e "${YELLOW}📋 TEST 2: Integridad Referencial${NC}"
echo "Verificando que todos los deliveryman_id existen en tabla users..."
run_query "
SELECT o.id, o.deliveryman_id, u.id, u.full_name
FROM orders o
LEFT JOIN users u ON o.deliveryman_id = u.id
WHERE o.deliveryman_id IS NOT NULL
ORDER BY o.id;
"
echo ""

# Test 3: Repartidores y sus entregas
echo -e "${YELLOW}📋 TEST 3: Repartidores y Entregas Asignadas${NC}"
run_query "
SELECT 
    u.id,
    u.full_name,
    COUNT(o.id) AS entregas_asignadas
FROM users u
LEFT JOIN orders o ON u.id = o.deliveryman_id
WHERE u.id IN (3, 4, 5)
GROUP BY u.id, u.full_name
ORDER BY u.id;
"
echo ""

# Test 4: Verificar no hay duplicados
echo -e "${YELLOW}📋 TEST 4: Verificar sin Duplicados${NC}"
echo "Si hay algún resultado aquí = PROBLEMA (pedidos con múltiples repartidores)"
run_query "
SELECT o.id, COUNT(DISTINCT o.deliveryman_id) as repartidores
FROM orders o
WHERE o.deliveryman_id IS NOT NULL
GROUP BY o.id
HAVING COUNT(DISTINCT o.deliveryman_id) > 1;
"
echo ""

# Test 5: Estado de pedidos por repartidor
echo -e "${YELLOW}📋 TEST 5: Pedidos por Estado y Repartidor${NC}"
run_query "
SELECT 
    o.status,
    COUNT(*) as cantidad,
    COUNT(CASE WHEN o.deliveryman_id IS NOT NULL THEN 1 END) as con_repartidor,
    COUNT(CASE WHEN o.deliveryman_id IS NULL THEN 1 END) as sin_repartidor
FROM orders o
GROUP BY o.status
ORDER BY o.status;
"
echo ""

# Test 6: Resumen completo
echo -e "${YELLOW}📋 TEST 6: Resumen Completo${NC}"
run_query "
SELECT 
    o.id,
    o.status,
    o.total_amount,
    u.full_name as repartidor,
    o.created_at
FROM orders o
LEFT JOIN users u ON o.deliveryman_id = u.id
ORDER BY o.id;
"
echo ""

echo -e "${GREEN}✅ PRUEBAS COMPLETADAS${NC}"
echo ""
echo "Resultado esperado:"
echo "- Pedidos en READY sin repartidor: puedo asignar"
echo "- Pedidos en DELIVERY_ASSIGNED: tienen repartidor"
echo "- Todos los deliveryman_id existen en tabla users"
echo "- No hay duplicados (máximo 1 repartidor por pedido)"
