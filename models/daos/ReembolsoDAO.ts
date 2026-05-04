import { db } from "@/config/db";

// models/daos/ReembolsoDAO.ts
/**
 * Capa de Persistencia para Gestión de Reembolsos
 * US026: Gestionar reembolsos y cancelaciones
 */
export class ReembolsoDAO {
  static async getPendingRefunds(restaurantId?: number) {
    let query = `
      SELECT ph.id AS order_id, ph.customer_id, u.full_name AS customer_name, ph.total_amount, ph.created_at, ph.status
      FROM pedido_historial ph
      JOIN users u ON u.id = ph.customer_id
      WHERE ph.status = 'CANCELLED'
    `;
    const params: any[] = [];
    if (restaurantId) {
      query += ` AND ph.restaurant_id = $1`;
      params.push(restaurantId);
    }
    query += ` ORDER BY ph.created_at DESC`;
    const result = await db.query(query, params);
    return result.rows;
  }

  static async approveRefund(orderId: number) {
    const result = await db.query(
      `UPDATE pedido_historial SET status = 'REFUNDED', refund_rejection_reason = NULL WHERE id = $1 AND status = 'CANCELLED' RETURNING id`,
      [orderId]
    );
    if (result.rowCount === 0) throw new Error("PedidoEntity no encontrado o no está pendiente de reembolso");
    return result.rows[0];
  }

  static async rejectRefund(orderId: number, reason: string) {
    const result = await db.query(
      `UPDATE pedido_historial SET status = 'REFUND_REJECTED', refund_rejection_reason = $2 WHERE id = $1 AND status = 'CANCELLED' RETURNING id`,
      [orderId, reason]
    );
    if (result.rowCount === 0) throw new Error("PedidoEntity no encontrado o no está pendiente de reembolso");
    return result.rows[0];
  }

  static async getRefundStats(restaurantId?: number, days: number = 30) {
    let query = `
      SELECT COUNT(*) as total_refunds, COALESCE(SUM(total_amount), 0) as total_amount,
             COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as pending,
             COUNT(CASE WHEN status = 'REFUNDED' THEN 1 END) as approved,
             COUNT(CASE WHEN status = 'REFUND_REJECTED' THEN 1 END) as rejected
      FROM pedido_historial
      WHERE created_at >= NOW() - INTERVAL '${days} days'
    `;
    const params: any[] = [];
    if (restaurantId) {
      query += ` AND restaurant_id = $1`;
      params.push(restaurantId);
    }
    const result = await db.query(query, params);
    return result.rows[0];
  }

  static async getRefundHistory(restaurantId?: number, limit: number = 50) {
    let query = `
      SELECT ph.id AS order_id, ph.customer_id, u.full_name AS customer_name, ph.total_amount, ph.created_at, ph.status, ph.refund_rejection_reason
      FROM pedido_historial ph
      JOIN users u ON u.id = ph.customer_id
      WHERE ph.status IN ('REFUNDED', 'REFUND_REJECTED')
    `;
    const params: any[] = [];
    if (restaurantId) {
      query += ` AND ph.restaurant_id = $1`;
      params.push(restaurantId);
    }
    query += ` ORDER BY ph.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await db.query(query, params);
    return result.rows;
  }

  static async initiateRefund(orderId: number, amount: number, reason: string) {
    // En este sistema, iniciar un reembolso es poner el pedido en CANCELLED 
    // si no lo estaba ya, o registrar la intención.
    const result = await db.query(
      `UPDATE pedido_historial SET status = 'CANCELLED', refund_rejection_reason = $2 
       WHERE id = $1 RETURNING id`,
      [orderId, reason]
    );
    return result.rows[0];
  }
}