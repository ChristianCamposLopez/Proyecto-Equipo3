// controllers/ReembolsoController.ts
import { ReembolsoDAO } from "../models/daos/ReembolsoDAO";

export class ReembolsoController {
  async getPendingRefunds() {
    const refunds = await ReembolsoDAO.getPendingRefunds();
    return { refunds };
  }

  async approveRefund(orderId: number) {
    await ReembolsoDAO.approveRefund(orderId);
    // Aquí puedes agregar notificación al cliente (email, push)
    // Ejemplo: notificar que el reembolso fue aprobado
    return { success: true, message: "Reembolso aprobado" };
  }

  async rejectRefund(orderId: number, reason: string) {
    await ReembolsoDAO.rejectRefund(orderId, reason);
    // Notificar al cliente con el motivo del rechazo
    // Ejemplo: enviar correo "Tu reembolso fue rechazado porque: ..."
    return { success: true, message: "Reembolso rechazado", reason };
  }
}