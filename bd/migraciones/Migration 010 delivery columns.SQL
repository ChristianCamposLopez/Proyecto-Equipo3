-- =============================================
-- MIGRACIÓN: Agregar columnas de entrega a orders
-- =============================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS assigned_courier_id INT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50) DEFAULT 'PENDING_ASSIGNMENT',
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;
