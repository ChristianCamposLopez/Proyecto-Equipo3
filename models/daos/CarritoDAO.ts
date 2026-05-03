// models/daos/CarritoDAO.ts
/**
 * Capa de Persistencia para Gestión de Carritos
 * US002: Persistencia del carrito virtual
 */

import { db } from "@/config/db";

export class CarritoDAO {
  
  static async getActiveCart(customerId: number) {
    const result = await db.query(
      `SELECT id, customer_id, restaurant_id
       FROM carts
       WHERE customer_id = $1 AND status = 'ACTIVE'
       LIMIT 1`,
      [customerId]
    );
    return result.rows[0] || null;
  }

  static async createCart(customerId: number) {
    const result = await db.query(
      `INSERT INTO carts (customer_id, status)
       VALUES ($1, 'ACTIVE')
       RETURNING id, customer_id, restaurant_id`,
      [customerId]
    );
    return result.rows[0];
  }

  static async getItems(cartId: number) {
    const result = await db.query(
      `SELECT
          ci.id,
          ci.product_id,
          p.name AS product_name,
          c.name AS category_name,
          COALESCE(pi.image_path, p.image_url) AS image_url,
          ci.quantity,
          p.stock AS available_stock,
          p.is_available,
          ci.unit_price::float8 AS unit_price,
          (ci.quantity * ci.unit_price)::float8 AS subtotal
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN product_images pi 
           ON pi.product_id = p.id 
           AND pi.is_primary = true 
           AND pi.deleted_at IS NULL
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at ASC, ci.id ASC`,
      [cartId]
    );
    return result.rows;
  }

  static async addItem(cartId: number, productId: number, quantity: number, unitPrice: number) {
    await db.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)`,
      [cartId, productId, quantity, unitPrice]
    );
  }

  static async updateItemQuantity(cartItemId: number, quantity: number) {
    await db.query(
      `UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2`,
      [quantity, cartItemId]
    );
  }

  static async removeItem(cartItemId: number) {
    await db.query(`DELETE FROM cart_items WHERE id = $1`, [cartItemId]);
  }

  static async clearItems(cartId: number) {
    await db.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);
  }

  static async updateRestaurant(cartId: number, restaurantId: number | null) {
    await db.query(
      `UPDATE carts SET restaurant_id = $1, updated_at = NOW() WHERE id = $2`,
      [restaurantId, cartId]
    );
  }

  static async closeCart(cartId: number, status: 'CHECKED_OUT' | 'ABANDONED') {
    await db.query(
      `UPDATE carts SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, cartId]
    );
  }
}
