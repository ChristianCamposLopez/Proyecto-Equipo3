// services/KitchenService.ts
// Capa de servicio — US004: Panel de Cocina en Tiempo Real

import { KitchenDAO } from '@/models/daos/KitchenDAO';
import { KitchenOrder } from '@/models/entities/KitchenOrder';

/**
 * KitchenService — Lógica de negocio para gestión de cocina.
 * US004: Panel de gestión de pedidos en tiempo real.
 * Controla las transiciones de estado válidas.
 */
export class KitchenService {
  private kitchenDAO: KitchenDAO;

  // Mapa de transiciones de estado válidas
  private static readonly VALID_TRANSITIONS: Record<string, string[]> = {
    'PENDING': ['PREPARING'],
    'PREPARING': ['READY'],
    'READY': ['COMPLETED'],
  };

  constructor() {
    this.kitchenDAO = new KitchenDAO();
  }

  /**
   * US004: Obtiene pedidos activos con sus items.
   */
  async getActiveOrders(): Promise<KitchenOrder[]> {
    const orders = await this.kitchenDAO.getActiveOrders();

    // Enriquecer cada pedido con sus items
    const ordersWithItems: KitchenOrder[] = await Promise.all(
      orders.map(async (order: KitchenOrder) => {
        const items = await this.kitchenDAO.getOrderItems(order.id);
        return { ...order, items };
      })
    );

    return ordersWithItems;
  }

  /**
   * US004: Actualiza el estado de un pedido con validación de transición.
   */
  async updateOrderStatus(orderId: number, newStatus: string): Promise<void> {
    const currentStatus = await this.kitchenDAO.getOrderStatus(orderId);

    if (!currentStatus) {
      throw new Error(`Pedido con id ${orderId} no encontrado`);
    }

    const allowedTransitions = KitchenService.VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Transición inválida: no se puede cambiar de ${currentStatus} a ${newStatus}. ` +
        `Transiciones válidas desde ${currentStatus}: ${allowedTransitions?.join(', ') || 'ninguna'}`
      );
    }

    await this.kitchenDAO.updateOrderStatus(orderId, newStatus);
  }
}
