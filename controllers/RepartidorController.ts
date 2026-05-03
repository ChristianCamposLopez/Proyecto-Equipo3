import { RepartidorDAO } from '@/models/daos/repartidorDAO';

export class RepartidorController {
  private repartidorDAO = new RepartidorDAO();

  async autoAssign(orderId: number): Promise<{
    orderId: number;
    repartidor: { id: number; nombre: string };
  }> {
    // Validaciones
    if (!orderId || isNaN(orderId)) throw new Error('orderId inválido');

    const orderInfo = await this.repartidorDAO.getOrderAutoAssignInfo(orderId);
    if (!orderInfo.exists) throw new Error('Orden no encontrada');
    if (orderInfo.alreadyAssigned) throw new Error('La orden ya tiene repartidor asignado');

    const repartidor = await this.repartidorDAO.findAvailableRepartidor();
    if (!repartidor) throw new Error('No hay repartidores disponibles');

    await this.repartidorDAO.assignDeliverymanToOrder(orderId, repartidor.id);

    return {
      orderId,
      repartidor: {
        id: repartidor.id,
        nombre: repartidor.full_name,
      },
    };
  }
}