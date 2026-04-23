// models/daos/ReembolsoDAO.ts
import { db } from "../../config/db";

export class ReembolsoDAO {
  // Listar pedidos cancelados pendientes de reembolso (status = 'CANCELLED')
  static async getPendingRefunds() {
    const result = await db.query(
      `
      SELECT 
        ph.id AS order_id,
        ph.customer_id,
        u.full_name AS customer_name,
        ph.total_amount,
        ph.created_at,
        ph.status
      FROM pedido_historial ph
      JOIN users u ON u.id = ph.customer_id
      WHERE ph.status = 'CANCELLED'
      ORDER BY ph.created_at DESC
      `
    );
    return result.rows;
  }

  // Aprobar reembolso: cambiar status a 'REFUNDED'
  static async approveRefund(orderId: number) {
    const result = await db.query(
      `UPDATE pedido_historial 
       SET status = 'REFUNDED', refund_rejection_reason = NULL 
       WHERE id = $1 AND status = 'CANCELLED'
       RETURNING id`,
      [orderId]
    );
    if (result.rowCount === 0) {
      throw new Error("Pedido no encontrado o no está pendiente de reembolso");
    }
    return result.rows[0];
  }

  // Rechazar reembolso: cambiar status a 'REFUND_REJECTED' y guardar motivo
  static async rejectRefund(orderId: number, reason: string) {
    const result = await db.query(
      `UPDATE pedido_historial 
       SET status = 'REFUND_REJECTED', refund_rejection_reason = $2
       WHERE id = $1 AND status = 'CANCELLED'
       RETURNING id`,
      [orderId, reason]
    );
    if (result.rowCount === 0) {
      throw new Error("Pedido no encontrado o no está pendiente de reembolso");
    }
    return result.rows[0];
  }
}