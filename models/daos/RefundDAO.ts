// models/daos/RefundDAO.ts — US026: Gestión de Reembolsos
import { db } from '@/config/db';
import { Refund } from '../entities/Refund';

export interface RefundRecord extends Refund {
  order_id?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
}

export class RefundDAO {
  /**
   * Crear un reembolso (método legado)
   */
  static async create(refund: Refund) {
    try {
      const query = `
        INSERT INTO refunds (payment_id, amount, reason)
        VALUES ($1,$2,$3)
        RETURNING *
      `;

      const result = await db.query(query, [
        refund.payment_id,
        refund.amount,
        refund.reason
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('[RefundDAO.create]', error);
      throw error;
    }
  }

  /**
   * Iniciar reembolso para una orden cancelada (US026)
   */
  async initiateRefund(
    orderId: number,
    amount: number,
    reason: string
  ): Promise<RefundRecord> {
    try {
      // Verificar que la orden existe
      const orderResult = await db.query(
        `SELECT id, status FROM orders WHERE id = $1`,
        [orderId]
      );

      if (orderResult.rowCount === 0) {
        throw new Error(`Orden no encontrada: ${orderId}`);
      }

      const order = orderResult.rows[0];

      // No permitir reembolsos en órdenes ya completadas o reembolsadas
      if (order.status === 'COMPLETED' || order.status === 'REFUNDED') {
        throw new Error(`No se puede reembolsar una orden con estado: ${order.status}`);
      }

      // Crear registro de reembolso
      const refundResult = await db.query(
        `INSERT INTO refunds (order_id, amount, reason, status, created_at)
         VALUES ($1, $2, $3, 'PENDING', NOW())
         RETURNING id, order_id, amount, reason, status, created_at`,
        [orderId, amount, reason]
      );

      return refundResult.rows[0];
    } catch (error) {
      console.error('[RefundDAO.initiateRefund]', error);
      throw error;
    }
  }

  /**
   * Aprobar un reembolso (US026)
   */
  async approveRefund(refundId: number): Promise<RefundRecord> {
    try {
      const result = await db.query(
        `UPDATE refunds 
         SET status = 'APPROVED', updated_at = NOW()
         WHERE id = $1
         RETURNING id, order_id, amount, reason, status, created_at`,
        [refundId]
      );

      if (result.rowCount === 0) {
        throw new Error(`Reembolso no encontrado: ${refundId}`);
      }

      return result.rows[0];
    } catch (error) {
      console.error('[RefundDAO.approveRefund]', error);
      throw error;
    }
  }

  /**
   * Rechazar un reembolso (US026)
   */
  async rejectRefund(refundId: number, rejectionReason?: string): Promise<RefundRecord> {
    try {
      const result = await db.query(
        `UPDATE refunds 
         SET status = 'REJECTED', 
             reason = COALESCE($2, reason),
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, order_id, amount, reason, status, created_at`,
        [refundId, rejectionReason]
      );

      if (result.rowCount === 0) {
        throw new Error(`Reembolso no encontrado: ${refundId}`);
      }

      return result.rows[0];
    } catch (error) {
      console.error('[RefundDAO.rejectRefund]', error);
      throw error;
    }
  }

  /**
   * Procesar un reembolso aprobado (US026)
   */
  async processRefund(refundId: number): Promise<RefundRecord> {
    try {
      const result = await db.query(
        `UPDATE refunds 
         SET status = 'PROCESSED', updated_at = NOW()
         WHERE id = $1 AND status = 'APPROVED'
         RETURNING id, order_id, amount, reason, status, created_at`,
        [refundId]
      );

      if (result.rowCount === 0) {
        throw new Error(`No se pudo procesar el reembolso (no encontrado o no aprobado)`);
      }

      // Actualizar estado de la orden a REFUNDED
      const refund = result.rows[0];
      await db.query(
        `UPDATE orders SET status = 'REFUNDED' WHERE id = $1`,
        [refund.order_id]
      );

      console.log(`[Refund] Reembolso procesado para orden ${refund.order_id}`);

      return refund;
    } catch (error) {
      console.error('[RefundDAO.processRefund]', error);
      throw error;
    }
  }

  /**
   * Obtener reembolsos pendientes de aprobación (US026)
   */
  async getPendingRefunds(restaurantId?: number): Promise<RefundRecord[]> {
    try {
      let query = `
        SELECT r.id, r.order_id, r.amount, r.reason, r.status, r.created_at
        FROM refunds r
        LEFT JOIN orders o ON r.order_id = o.id
        WHERE r.status = 'PENDING'
      `;

      const params: (string | number)[] = [];

      if (restaurantId) {
        query += ` AND o.restaurant_id = $1`;
        params.push(restaurantId);
      }

      query += ` ORDER BY r.created_at DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('[RefundDAO.getPendingRefunds]', error);
      throw error;
    }
  }

  /**
   * Obtener historial de reembolsos (US026)
   */
  async getRefundHistory(
    restaurantId?: number,
    limit: number = 50
  ): Promise<RefundRecord[]> {
    try {
      let query = `
        SELECT r.id, r.order_id, r.amount, r.reason, r.status, r.created_at
        FROM refunds r
        LEFT JOIN orders o ON r.order_id = o.id
        WHERE 1=1
      `;

      const params: (string | number)[] = [];

      if (restaurantId) {
        query += ` AND o.restaurant_id = $1`;
        params.push(restaurantId);
      }

      query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('[RefundDAO.getRefundHistory]', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de reembolsos (US026)
   */
  async getRefundStats(
    restaurantId?: number,
    days: number = 30
  ): Promise<{
    total_refunds: number;
    total_amount: number;
    pending: number;
    approved: number;
    rejected: number;
    processed: number;
  }> {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_refunds,
          COALESCE(SUM(amount), 0) as total_amount,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected,
          COUNT(CASE WHEN status = 'PROCESSED' THEN 1 END) as processed
        FROM refunds r
        LEFT JOIN orders o ON r.order_id = o.id
        WHERE r.created_at >= NOW() - INTERVAL '${days} days'
      `;

      const params: (string | number)[] = [];

      if (restaurantId) {
        query += ` AND o.restaurant_id = $1`;
        params.push(restaurantId);
      }

      const result = await db.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('[RefundDAO.getRefundStats]', error);
      throw error;
    }
  }
}