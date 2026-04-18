// models/daos/KitchenDAO.ts
// Capa de persistencia — US004: Panel de Cocina en Tiempo Real

import { db } from '@/config/db';

/**
 * KitchenDAO — Consultas para la gestión de pedidos desde cocina.
 * US004: Panel de gestión de pedidos en tiempo real.
 */
export class KitchenDAO {

  /**
   * US004: Obtiene pedidos activos (PENDING, PREPARING, READY)
   * con información del cliente.
   */
  async getActiveOrders() {
    const result = await db.query(`
      SELECT
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        u.full_name AS customer_name
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.status IN ('PENDING', 'PREPARING', 'READY')
      ORDER BY
        CASE o.status
          WHEN 'PENDING' THEN 1
          WHEN 'PREPARING' THEN 2
          WHEN 'READY' THEN 3
        END,
        o.created_at ASC
    `);
    return result.rows;
  }

  /**
   * US004: Obtiene los items de un pedido específico.
   */
  async getOrderItems(orderId: number) {
    const result = await db.query(`
      SELECT
        p.name AS product_name,
        oi.quantity,
        oi.unit_price_at_purchase AS unit_price
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);
    return result.rows;
  }

  /**
   * US004: Actualiza el estado de un pedido.
   * Transiciones válidas: PENDING → PREPARING → READY → COMPLETED
   */
  async updateOrderStatus(orderId: number, newStatus: string): Promise<void> {
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2',
      [newStatus, orderId]
    );
    if (result.rowCount === 0) {
      throw new Error(`Pedido con id ${orderId} no encontrado`);
    }
  }

  /**
   * Obtiene el estado actual de un pedido.
   */
  async getOrderStatus(orderId: number): Promise<string | null> {
    const result = await db.query(
      'SELECT status FROM orders WHERE id = $1',
      [orderId]
    );
    return result.rows.length > 0 ? result.rows[0].status : null;
  }
}
