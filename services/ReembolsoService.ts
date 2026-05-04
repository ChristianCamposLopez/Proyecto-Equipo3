// services/ReembolsoService.ts
// US026: Gestión de Reembolsos
import { ReembolsoDAO } from "../models/daos/ReembolsoDAO";

export class ReembolsoService {
  /**
   * US026: Obtener reembolsos pendientes
   */
  async getPendingRefunds(restaurantId: number = 1) {
    const refunds = await ReembolsoDAO.getPendingRefunds(restaurantId);
    return { refunds };
  }

  /**
   * US026: Obtener historial de reembolsos
   */
  async getRefundHistory(restaurantId: number = 1, limit: number = 50) {
    return await ReembolsoDAO.getRefundHistory(restaurantId, limit);
  }

  /**
   * US026: Obtener estadísticas de reembolsos
   */
  async getRefundStats(restaurantId: number = 1) {
    return await ReembolsoDAO.getRefundStats(restaurantId);
  }

  /**
   * US026: Iniciar un nuevo reembolso (asociado a cancelación)
   */
  async initiateRefund(orderId: number, amount: number, reason: string) {
    if (!orderId || !amount || !reason) throw new Error("Datos incompletos");
    return await ReembolsoDAO.initiateRefund(orderId, amount, reason);
  }

  /**
   * US026: Aprobar reembolso
   */
  async approveRefund(refundId: number) {
    await ReembolsoDAO.approveRefund(refundId);
    return { success: true, message: "Reembolso aprobado" };
  }

  /**
   * US026: Rechazar reembolso
   */
  async rejectRefund(refundId: number, reason: string) {
    if (!reason) throw new Error("Se requiere un motivo de rechazo");
    await ReembolsoDAO.rejectRefund(refundId, reason);
    return { success: true, message: "Reembolso rechazado", reason };
  }
}