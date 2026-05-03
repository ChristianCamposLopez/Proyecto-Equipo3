import { PaymentDAO } from "@/models/daos/PaymentDAO";

export class PaymentService {
  
  /**
   * Simula el procesamiento de un pago digital
   * US003
   */
  async processPayment(orderId: number, amount: number, method: string): Promise<boolean> {
    // 1. Simulación de pasarela (Simpre exitoso para propósitos escolares)
    const success = true; 

    if (success) {
      await PaymentDAO.registrarPago(orderId, amount, method, 'SUCCESS');
      // El cambio de estado del pedido se maneja usualmente en PedidoService tras la confirmación del pago
      return true;
    }
    
    await PaymentDAO.registrarPago(orderId, amount, method, 'FAILED');
    return false;
  }

  async processRefundForOrder(orderId: number) {
    const paymentQuery = `
      SELECT * FROM payments
      WHERE order_id = $1
      AND status = 'SUCCESS'
    `;

    const paymentResult = await db.query(paymentQuery, [orderId]);

    if (paymentResult.rows.length === 0) {
      throw new Error("No se encontró un pago exitoso para este pedido");
    }

    const payment = paymentResult.rows[0];

    // Usar el DAO de reembolsos si se requiere registro formal
    // Por ahora, actualizamos el estado del pago directamente para simplificar
    await db.query(
      "UPDATE payments SET status='REFUNDED' WHERE id=$1",
      [payment.id]
    );

    await db.query(
      "UPDATE orders SET status='CANCELLED' WHERE id=$1",
      [orderId]
    );
  }
}