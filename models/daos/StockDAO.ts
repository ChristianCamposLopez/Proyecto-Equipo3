// models/daos/StockDAO.ts
// Capa de persistencia — US008: Control de Stock (Plato Agotado)

import { db } from '@/config/db';

/**
 * StockDAO — Persistencia para la disponibilidad de productos.
 * US008: El chef marca un plato como "agotado".
 */
export class StockDAO {

  /**
   * US008: Cambia la disponibilidad de un producto.
   * @param productId - ID del producto
   * @param isAvailable - true = disponible, false = agotado
   */
  async toggleAvailability(productId: number, isAvailable: boolean): Promise<void> {
    const result = await db.query(
      'UPDATE products SET is_available = $1 WHERE id = $2',
      [isAvailable, productId]
    );
    if (result.rowCount === 0) {
      throw new Error(`Producto con id ${productId} no encontrado`);
    }
  }

  /**
   * Obtiene todos los productos con su estado de disponibilidad.
   */
  async getAllProductsWithStatus() {
    const result = await db.query(`
      SELECT
        p.id,
        p.name,
        p.base_price,
        p.is_available,
        c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY c.name, p.name
    `);
    return result.rows;
  }

  /**
   * Obtiene el estado de disponibilidad de un producto.
   */
  async getProductStatus(productId: number) {
    const result = await db.query(
      'SELECT id, name, is_available FROM products WHERE id = $1',
      [productId]
    );
    if (result.rows.length === 0) {
      throw new Error(`Producto con id ${productId} no encontrado`);
    }
    return result.rows[0];
  }
}
