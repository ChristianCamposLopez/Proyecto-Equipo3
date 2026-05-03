-- =============================================
-- MIGRACIÓN: Agregar columnas de stock a products
-- =============================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 50,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 10;
