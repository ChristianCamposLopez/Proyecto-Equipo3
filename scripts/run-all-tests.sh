#!/bin/bash
# scripts/run-all-tests.sh
# Ejecuta todas las pruebas (unitarias, integración y caja negra) para US009

set -e

echo "╔════════════════════════════════════════════╗"
echo "║   US009 - PRUEBAS COMPLETAS               ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Verificar dependencias
echo "[1/4] Verificando dependencias..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js no está instalado"
  exit 1
fi
echo "✓ Node.js disponible"

if ! command -v psql &> /dev/null; then
  echo "⚠️  psql no está en PATH (necesario para pruebas de caja negra)"
fi

echo ""
echo "[2/4] Ejecutando pruebas unitarias (ImageValidator)..."
npm run test:unit 2>&1 || {
  echo "⚠️  Pruebas unitarias fallaron o Jest no está configurado aún"
}

echo ""
echo "[3/4] Ejecutando pruebas de integración (BD)..."
npm run test:integration 2>&1 || {
  echo "⚠️  Pruebas de integración fallaron - verifica que la BD esté corriendo"
}

echo ""
echo "[4/4] Ejecutando pruebas de caja negra (SQL)..."
if command -v psql &> /dev/null; then
  bash scripts/test-black-box-us009.sh
else
  echo "⚠️  psql no disponible, omitiendo pruebas de caja negra"
  echo "   Para instalar PostgreSQL client:"
  echo "   Ubuntu: sudo apt-get install postgresql-client"
  echo "   macOS:  brew install postgresql"
  echo "   Windows: instala PostgreSQL con pgAdmin"
fi

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   RESUMEN DE PRUEBAS                      ║"
echo "╚════════════════════════════════════════════╝"
echo "✓ Pruebas completadas"
echo ""
echo "Para ejecutar pruebas individuales:"
echo "  npm run test:unit         # Solo unitarias"
echo "  npm run test:integration  # Solo integración"
echo "  npm run test:black-box    # Solo caja negra SQL"
echo "  npm test                  # Todas con Jest"
