// models/daos/StockDAO.ts
/**
 * Capa de persistencia para Gestión de Stock y Productos
 * 
 * Historias de Usuario integradas:
 * - US008: Gestión de stock (actualizar, agregar, descontar)
 * - US009: Gestión de imágenes de productos
 * - US020: Disponibilidad horaria de productos
 */

import { db } from '@/config/db';
import { ProductoEntity } from '@/models/entities';

export class StockDAO {
  
  /**
   * Obtiene un producto con su stock actual
   * US008: Gestión de stock
   */
  static async getProductWithStock(productId: number): Promise<ProductoEntity | null> {
    const result = await db.query(`SELECT * FROM products WHERE id = $1`, [productId]);
    return result.rowCount === 0 ? null : result.rows[0];
  }

  /**
   * Obtiene todos los productos de un restaurante con su stock
   * US008
   */
  static async getProductsWithStock(restaurantId: number): Promise<ProductoEntity[]> {
    const result = await db.query(
      `SELECT p.* 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE c.restaurant_id = $1 AND p.deleted_at IS NULL
       ORDER BY p.name`,
      [restaurantId]
    );
    return result.rows;
  }

  /**
   * Actualiza el stock manualmente
   * US008.1: Actualizar stock
   */
  static async updateStock(productId: number, newQuantity: number, reason?: string): Promise<ProductoEntity> {
    const result = await db.query(
      `UPDATE products 
       SET stock = $1, is_available = CASE WHEN $1 > 0 THEN true ELSE false END 
       WHERE id = $2 RETURNING *`,
      [newQuantity, productId]
    );
    if (result.rowCount === 0) throw new Error(`Producto no encontrado`);
    return result.rows[0];
  }

  /**
   * Incrementa el stock (reabastecimiento)
   * US008.2: Agregar stock
   */
  static async addStock(productId: number, quantity: number): Promise<ProductoEntity> {
    const result = await db.query(
      `UPDATE products 
       SET stock = stock + $1, is_available = true 
       WHERE id = $2 RETURNING *`,
      [quantity, productId]
    );
    return result.rows[0];
  }

  /**
   * Decrementa el stock (venta)
   * US008.3: Descontar stock
   */
  static async decreaseStock(productId: number, quantity: number): Promise<ProductoEntity> {
    const result = await db.query(
      `UPDATE products 
       SET stock = GREATEST(stock - $1, 0), 
           is_available = CASE WHEN stock - $1 <= 0 THEN false ELSE true END 
       WHERE id = $2 RETURNING *`,
      [quantity, productId]
    );
    return result.rows[0];
  }

  /**
   * Obtiene alertas de stock bajo
   * US008: Alertas de stock
   */
  static async getLowStockAlerts(restaurantId: number): Promise<ProductoEntity[]> {
    const result = await db.query(
      `SELECT p.* 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE c.restaurant_id = $1 
         AND p.deleted_at IS NULL
         AND (p.stock = 0 OR p.stock <= 5)`, // Using default threshold 5
      [restaurantId]
    );
    return result.rows;
  }

  /**
   * Resumen de stock para dashboard
   */
  static async getStockSummary(restaurantId: number) {
    const result = await db.query(
      `SELECT COUNT(*) as total_products,
              SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock,
              SUM(CASE WHEN stock <= 5 AND stock > 0 THEN 1 ELSE 0 END) as low_stock
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE c.restaurant_id = $1 AND p.deleted_at IS NULL`,
      [restaurantId]
    );
    return result.rows[0];
  }

  /**
   * Descuenta stock masivamente por un pedido
   * Integración US008 + US011
   */
  static async decreaseStockForOrder(orderId: number): Promise<void> {
    const result = await db.query(`SELECT product_id, quantity FROM order_items WHERE order_id = $1`, [orderId]);
    for (const item of result.rows) {
      await this.decreaseStock(item.product_id, item.quantity);
    }
  }

  /**
   * Restaura stock masivamente por cancelación
   * Integración US008 + US024
   */
  static async restoreStockForOrder(orderId: number): Promise<void> {
    const result = await db.query(`SELECT product_id, quantity FROM order_items WHERE order_id = $1`, [orderId]);
    for (const item of result.rows) {
      await this.addStock(item.product_id, item.quantity);
    }
  }

  /**
   * Marca como agotado inmediatamente
   * US008
   */
  static async markOutOfStock(productId: number): Promise<ProductoEntity> {
    return await this.updateStock(productId, 0, 'Manual mark out of stock');
  }

  /**
   * Marca como disponible con stock inicial
   * US008
   */
  static async markAvailable(productId: number, initialStock: number): Promise<ProductoEntity> {
    return await this.updateStock(productId, initialStock, 'Manual restore availability');
  }
}

