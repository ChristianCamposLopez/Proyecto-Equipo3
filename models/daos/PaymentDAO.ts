// models/daos/PaymentDAO.ts
/**
 * Capa de Persistencia para Pagos
 * US003: Pago Digital
 */

import { db } from "@/config/db";

export class PaymentDAO {
  
  static async registrarPago(orderId: number, amount: number, method: string, status: string) {
    const result = await db.query(
      `INSERT INTO payments (order_id, amount, payment_method, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [orderId, amount, method, status]
    );
    return result.rows[0];
  }

  static async findByOrder(orderId: number) {
    const result = await db.query(
      `SELECT * FROM payments WHERE order_id = $1`,
      [orderId]
    );
    return result.rows[0] || null;
  }

  static async actualizarEstado(paymentId: number, status: string) {
    await db.query(`UPDATE payments SET status = $1 WHERE id = $2`, [status, paymentId]);
  }
}
