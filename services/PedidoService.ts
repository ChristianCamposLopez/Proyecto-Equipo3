// services/PedidoService.ts
// US004: Dashboard Chef (Gestionado vía DAOs en otros métodos)
// US011: Gestión de estados y confirmación
// US027: Historial de pedidos
import { PedidoDAO } from "@/models/daos/PedidoDAO";
import { StockDAO } from "@/models/daos/StockDAO";
import { CarritoDAO } from "@/models/daos/CarritoDAO";
import { db } from "@/config/db";
import { PedidoEntity, PedidoWithItems } from "@/models/entities/PedidoEntity";

export class PedidoService {
  async getPedidos(userId: number) {
    return await PedidoDAO.getPedidosByUser(userId);
  }

  async registrarHistorial(
    orderId: number,
    customerId: number,
    restaurantId: number,
    items: { product_id: number; quantity: number }[]
  ) {
    if (!items || items.length === 0) {
      throw new Error("No hay items para registrar en historial");
    }
    return await PedidoDAO.registrarHistorial(orderId, customerId, restaurantId, items, {}); // Empty address if not provided
  }

  async cancelPedido(pedidoId: number) {
    return await PedidoDAO.cancelPedido(pedidoId);
  }

  async getPendingOrders(restaurantId: number): Promise<PedidoEntity[]> {
    return await PedidoDAO.getPendingOrders(restaurantId);
  }

  async getPendingOrdersForChef(restaurantId: number) {
    return await PedidoDAO.getPendingOrdersForChef(restaurantId);
  }

  async confirmOrder(orderId: number): Promise<PedidoEntity> {
    const confirmedOrder = await PedidoDAO.confirmOrder(orderId);
    await StockDAO.decreaseStockForOrder(orderId);
    return confirmedOrder;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<PedidoEntity> {
    if (!status) throw new Error('Se requiere el campo "status"');
    return await PedidoDAO.updateOrderStatus(orderId, status);
  }

  async updateStatus(orderId: number, status: string) {
    return await this.updateOrderStatus(orderId, status);
  }

  async getOrderById(orderId: number): Promise<PedidoWithItems | null> {
    return await PedidoDAO.getOrderWithItems(orderId);
  }

  async completarPedido(pedidoId: number) {
    return await PedidoDAO.completarPedido(pedidoId);
  }

  normalizeOrderNote(note: string): string {
    if (!note) return "";
    const trimmed = note.trim();
    if (trimmed.length > 200) {
      throw new Error("La nota no puede exceder 200 caracteres");
    }
    return trimmed;
  }

  /**
   * US002 / US011: Proceso de checkout estandarizado
   * Convierte el carrito activo en la DB en un pedido real.
   */
  async checkout(customerId: number, note?: string, addressId?: number) {
    const normalizedNote = this.normalizeOrderNote(note || "");

    const cart = await CarritoDAO.getActiveCart(customerId);
    if (!cart) throw new Error("No tienes un carrito activo");

    const items = await CarritoDAO.getItems(cart.id);
    if (items.length === 0) throw new Error("El carrito está vacío");

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    if (totalAmount <= 0) throw new Error("El monto total debe ser mayor a cero");

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // 0. Obtener dirección si existe
      let addressJson = {};
      if (addressId) {
        const addrRes = await client.query(`SELECT * FROM delivery_addresses WHERE id = $1`, [addressId]);
        if (addrRes.rows.length > 0) {
          const d = addrRes.rows[0];
          addressJson = {
            street: d.street,
            ext_num: d.exterior_number,
            neighborhood: d.neighborhood,
            city: d.city,
            state: d.state,
            postal_code: d.postal_code,
            references: d.delivery_references
          };
        }
      }

      // 1. Crear la orden activa en tabla orders
      const orderRes = await client.query(
        `INSERT INTO orders (customer_id, restaurant_id, status, total_amount, note, delivery_address_json, created_at)
         VALUES ($1, $2, 'PENDING', $3, $4, $5, NOW())
         RETURNING id`,
        [customerId, cart.restaurant_id, totalAmount, normalizedNote || null, addressJson]
      );
      const orderId = orderRes.rows[0].id;

      // 2. Crear items de la orden activa en tabla order_items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.product_id, item.quantity, item.unit_price]
        );
      }

      // 3. Registrar en historial (US027) usando el MISMO cliente de transacción
      await PedidoDAO.registrarHistorial(
        orderId, 
        customerId, 
        cart.restaurant_id!, 
        items.map(i => ({ product_id: i.product_id, quantity: i.quantity })), 
        addressJson,
        client
      );

      // 4. Vaciar carrito (US002)
      await CarritoDAO.clearItems(cart.id);
      await CarritoDAO.updateRestaurant(cart.id, null);

      await client.query("COMMIT");
      return { success: true, orderId };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}