-- =============================================
-- MIGRACIÓN US009: Gestión Multimedia de Platillos
-- Agrega soporte de imagen a la tabla products
-- =============================================
 
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS image_uploaded_at TIMESTAMP;
 