// models/daos/StockDAO.ts
import { db } from '@/config/db';
import { Product, StockAlert } from '../entities/Stock';

export class StockDAO {
  // ─── US008: GET producto con stock ────────────────────────────────────
  async getProductWithStock(productId: number): Promise<Product | null> {
    const result = await db.query(
      `SELECT 
        id, category_id, name, base_price, is_available, image_url, 
        stock_quantity, low_stock_threshold, last_stock_update
       FROM products
       WHERE id = $1`,
      [productId]
    );
    if (result.rowCount === 0) return null;
    return result.rows[0] as Product;
  }

  // Obtener todos los productos con stock de un restaurante
  async getProductsWithStock(restaurantId: number): Promise<Product[]> {
    const result = await db.query(
      `SELECT 
        p.id, p.category_id, p.name, p.base_price, p.is_available, p.image_url,
        p.stock_quantity, p.low_stock_threshold, p.last_stock_update
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE c.restaurant_id = $1
       ORDER BY p.name`,
      [restaurantId]
    );
    return result.rows as Product[];
  }

  // ─── US008: Actualizar stock de un producto ──────────────────────────
  /**
   * Actualiza el stock de un producto y ajusta is_available automáticamente
   * Si stock llega a 0: is_available = false
   * Si stock > 0: is_available = true (si estaba marcado como agotado)
   */
  async updateStock(productId: number, newQuantity: number, reason?: string): Promise<Product> {
    if (newQuantity < 0) {
      throw new Error('La cantidad de stock no puede ser negativa');
    }

    // Determinar is_available basado en stock
    const shouldBeAvailable = newQuantity > 0;

    const result = await db.query(
      `UPDATE products
       SET 
        stock_quantity = $1,
        is_available = $2,
        last_stock_update = NOW()
       WHERE id = $3
       RETURNING id, category_id, name, base_price, is_available, image_url,
                 stock_quantity, low_stock_threshold, last_stock_update`,
      [newQuantity, shouldBeAvailable, productId]
    );

    if (result.rowCount === 0) {
      throw new Error(`Producto con id ${productId} no encontrado`);
    }

    const updated = result.rows[0] as Product;
    console.log(`[updateStock] Producto ${productId}: stock actualizado a ${newQuantity}. Disponible: ${shouldBeAvailable}`);

    return updated;
  }

  // ─── US008: Marcar como agotado ──────────────────────────────────────
  async markOutOfStock(productId: number): Promise<Product> {
    const result = await db.query(
      `UPDATE products
       SET 
        stock_quantity = 0,
        is_available = false,
        last_stock_update = NOW()
       WHERE id = $1
       RETURNING id, category_id, name, base_price, is_available, image_url,
                 stock_quantity, low_stock_threshold, last_stock_update`,
      [productId]
    );

    if (result.rowCount === 0) {
      throw new Error(`Producto con id ${productId} no encontrado`);
    }

    return result.rows[0] as Product;
  }

  // Marcar como disponible (restaurar de agotado)
  async markAvailable(productId: number, initialStock: number = 10): Promise<Product> {
    if (initialStock <= 0) {
      throw new Error('El stock inicial debe ser mayor a 0');
    }

    const result = await db.query(
      `UPDATE products
       SET 
        stock_quantity = $1,
        is_available = true,
        last_stock_update = NOW()
       WHERE id = $2
       RETURNING id, category_id, name, base_price, is_available, image_url,
                 stock_quantity, low_stock_threshold, last_stock_update`,
      [initialStock, productId]
    );

    if (result.rowCount === 0) {
      throw new Error(`Producto con id ${productId} no encontrado`);
    }

    return result.rows[0] as Product;
  }

  // Aumentar stock (reabastecimiento)
  async addStock(productId: number, quantity: number): Promise<Product> {
    if (quantity <= 0) {
      throw new Error('La cantidad a agregar debe ser mayor a 0');
    }

    const result = await db.query(
      `UPDATE products
       SET 
        stock_quantity = stock_quantity + $1,
        is_available = true,
        last_stock_update = NOW()
       WHERE id = $2
       RETURNING id, category_id, name, base_price, is_available, image_url,
                 stock_quantity, low_stock_threshold, last_stock_update`,
      [quantity, productId]
    );

    if (result.rowCount === 0) {
      throw new Error(`Producto con id ${productId} no encontrado`);
    }

    return result.rows[0] as Product;
  }

  // Descontar stock (cuando se vende)
  async decreaseStock(productId: number, quantity: number): Promise<Product> {
    if (quantity <= 0) {
      throw new Error('La cantidad a descontar debe ser mayor a 0');
    }

    // Obtener stock actual
    const current = await this.getProductWithStock(productId);
    if (!current) {
      throw new Error(`Producto con id ${productId} no encontrado`);
    }

    const newQuantity = Math.max(0, current.stock_quantity - quantity);
    const shouldBeAvailable = newQuantity > 0;

    const result = await db.query(
      `UPDATE products
       SET 
        stock_quantity = $1,
        is_available = $2,
        last_stock_update = NOW()
       WHERE id = $3
       RETURNING id, category_id, name, base_price, is_available, image_url,
                 stock_quantity, low_stock_threshold, last_stock_update`,
      [newQuantity, shouldBeAvailable, productId]
    );

    return result.rows[0] as Product;
  }

  // Obtener alertas de stock bajo
  async getLowStockAlerts(restaurantId: number): Promise<StockAlert[]> {
    const result = await db.query(
      `SELECT 
        p.id as product_id,
        p.name,
        p.stock_quantity as current_stock,
        p.low_stock_threshold as threshold,
        CASE 
          WHEN p.stock_quantity = 0 THEN 'OUT_OF_STOCK'
          WHEN p.stock_quantity <= p.low_stock_threshold THEN 'LOW_STOCK'
          ELSE 'NORMAL'
        END as status
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE c.restaurant_id = $1
       AND (p.stock_quantity = 0 OR p.stock_quantity <= p.low_stock_threshold)
       ORDER BY p.stock_quantity ASC, p.name`,
      [restaurantId]
    );
    return result.rows as StockAlert[];
  }

  // Obtener resumen de stock
  async getStockSummary(restaurantId: number): Promise<{
    total_products: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
  }> {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN stock_quantity > low_stock_threshold THEN 1 END) as in_stock,
        COUNT(CASE WHEN stock_quantity > 0 AND stock_quantity <= low_stock_threshold THEN 1 END) as low_stock,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE c.restaurant_id = $1`,
      [restaurantId]
    );

    const row = result.rows[0];
    return {
      total_products: parseInt(row.total_products),
      in_stock: parseInt(row.in_stock),
      low_stock: parseInt(row.low_stock),
      out_of_stock: parseInt(row.out_of_stock)
    };
  }

  // Actualizar threshold de stock bajo
  async updateLowStockThreshold(productId: number, threshold: number): Promise<void> {
    if (threshold < 0) {
      throw new Error('El threshold no puede ser negativo');
    }

    const result = await db.query(
      `UPDATE products
       SET low_stock_threshold = $1
       WHERE id = $2`,
      [threshold, productId]
    );

    if (result.rowCount === 0) {
      throw new Error(`Producto con id ${productId} no encontrado`);
    }
  }
}
