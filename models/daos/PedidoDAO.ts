// models/daos/PedidoDAO.ts
/**
 * Capa de persistencia para Pedidos (Orders)
 * Consolida PedidoDAO y OrderDAO original.
 * 
 * Historias de Usuario integradas:
 * - US007: Notas especiales del cliente
 * - US011: Gestión de estados (PENDING, PREPARING, READY, etc.)
 * - US012: Asignación de repartidores
 * - US023: Recomendación de productos
 * - US024: Cancelación de pedidos
 * - US026: Reembolsos (vía estado CANCELLED/REFUNDED)
 * - US027: Historial de pedidos del cliente
 */

import { db } from "@/config/db";
import { PedidoEntity, PedidoItem, PedidoWithItems } from "@/models/entities";

export class PedidoDAO {
  
  /**
   * Registra un pedido en el historial (pedido_historial)
   * US027: Ver historial de pedidos
   */
  static async registrarHistorial(
    orderId: number,
    customerId: number,
    restaurantId: number,
    items: { product_id: number; quantity: number }[],
    addressJson: any,
    existingClient?: any
  ) {
    const client = existingClient || await db.connect();
    const shouldManageTransaction = !existingClient;

    try {
      if (shouldManageTransaction) await client.query("BEGIN");

      // Obtener precios actuales de los productos
      const productIds = items.map(i => i.product_id);
      const productsRes = await client.query(
        `SELECT id, base_price FROM products WHERE id = ANY($1)`,
        [productIds]
      );
      if (productsRes.rowCount !== items.length) {
        throw new Error("Algún producto no existe");
      }

      const priceMap = new Map<number, number>();
      for (const row of productsRes.rows) {
        priceMap.set(row.id, Number(row.base_price));
      }

      let total = 0;
      for (const item of items) {
        total += priceMap.get(item.product_id)! * item.quantity;
      }

      // Insertar en historial (US027)
      await client.query(
        `INSERT INTO pedido_historial (id, customer_id, restaurant_id, status, total_amount, delivery_address_json)
        VALUES ($1, $2, $3, 'PENDING', $4, $5)
        ON CONFLICT (id) DO NOTHING`,
        [orderId, customerId, restaurantId, total, addressJson]
      );

      for (const item of items) {
        const unitPrice = priceMap.get(item.product_id)!;
        await client.query(
          `INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
          VALUES ($1, $2, $3, $4)`,
          [orderId, item.product_id, item.quantity, unitPrice]
        );
      }

      if (shouldManageTransaction) await client.query("COMMIT");
      return { success: true };
    } catch (e) {
      if (shouldManageTransaction) await client.query("ROLLBACK");
      throw e;
    } finally {
      if (shouldManageTransaction) client.release();
    }
  }

  /**
   * Cancela un pedido y restaura stock
   * US024: Cancelación de pedidos
   */
  static async cancelPedido(orderId: number) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const historialCheck = await client.query(
        `SELECT status FROM pedido_historial WHERE id = $1 FOR UPDATE`,
        [orderId]
      );
      if (historialCheck.rowCount === 0) throw new Error("PedidoEntity no encontrado");
      
      const currentStatus = historialCheck.rows[0].status;
      if (currentStatus !== 'PENDING') throw new Error(`No se puede cancelar en estado ${currentStatus}`);

      // Actualizar a CANCELLED (US024)
      await client.query(`UPDATE pedido_historial SET status = 'CANCELLED' WHERE id = $1`, [orderId]);

      // Restaurar stock (Integración con US008)
      const items = await client.query(
        `SELECT product_id, quantity FROM pedido_items_historial WHERE order_id = $1`,
        [orderId]
      );

      for (const item of items.rows) {
        await client.query(
          `UPDATE products SET stock = stock + $1, is_available = TRUE WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }
      
      // Eliminar de tablas activas
      await client.query(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);
      await client.query(`DELETE FROM orders WHERE id = $1`, [orderId]);

      await client.query("COMMIT");
      return { message: "PedidoEntity cancelado exitosamente" };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Finaliza un pedido (COMPLETED)
   * US011: Gestión de estados
   */
  static async completarPedido(orderId: number) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      await client.query(`UPDATE pedido_historial SET status = 'COMPLETED' WHERE id = $1`, [orderId]);
      await client.query(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);
      await client.query(`DELETE FROM orders WHERE id = $1`, [orderId]); 
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Obtiene pedidos por usuario
   * US027: Historial de pedidos
   */
  static async getPedidosByUser(userId: number) {
    const result = await db.query(
      `SELECT ph.*, o.status AS active_status, CASE WHEN o.id IS NOT NULL THEN true ELSE false END AS is_active
      FROM pedido_historial ph
      LEFT JOIN orders o ON o.id = ph.id
      WHERE ph.customer_id = $1
      ORDER BY ph.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Obtiene una orden activa por ID
   * US011: Gestión de estados
   */
  static async getOrderById(orderId: number): Promise<PedidoEntity | null> {
    const result = await db.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    return result.rowCount === 0 ? null : result.rows[0];
  }

  /**
   * Lista órdenes activas por restaurante
   * US011: Gestión de estados
   */
  static async getOrdersByRestaurant(restaurantId: number): Promise<PedidoEntity[]> {
    const result = await db.query(
      `SELECT * FROM orders WHERE restaurant_id = $1 ORDER BY created_at DESC`,
      [restaurantId]
    );
    return result.rows;
  }

  /**
   * Obtiene orden con sus items
   * US011 / US007
   */
  static async getOrderWithItems(orderId: number): Promise<PedidoWithItems | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;
    const items = await db.query(`SELECT * FROM order_items WHERE order_id = $1`, [orderId]);
    return { ...order, items: items.rows };
  }

  /**
   * Confirma un pedido
   * US011: PENDING -> CONFIRMED
   */
  static async confirmOrder(orderId: number): Promise<PedidoEntity> {
    const result = await db.query(
      `UPDATE orders SET status = 'CONFIRMED', confirmed_at = NOW() WHERE id = $1 RETURNING *`,
      [orderId]
    );
    if (result.rowCount === 0) throw new Error("No se pudo confirmar el pedido");
    return result.rows[0];
  }

  /**
   * Actualiza el estado de una orden activa
   * US011: Gestión de estados
   */
  static async updateOrderStatus(orderId: number, newStatus: string): Promise<PedidoEntity> {
    const result = await db.query(`UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`, [newStatus, orderId]);
    if (result.rowCount === 0) throw new Error("No se pudo actualizar el estado");
    
    // US027 / US025: Sincronizar con historial para que aparezca en reportes de ventas
    let historyStatus = newStatus;
    if (newStatus === 'DELIVERED') historyStatus = 'COMPLETED';
    
    const validHistoryStatuses = ['CANCELLED', 'COMPLETED', 'PENDING', 'REFUNDED', 'REFUND_REJECTED'];
    if (validHistoryStatuses.includes(historyStatus)) {
      await db.query(`UPDATE pedido_historial SET status = $1 WHERE id = $2`, [historyStatus, orderId]);
    }

    return result.rows[0];
  }

  /**
   * Lista pedidos pendientes para cocina
   * US011: Dashboard de cocina
   */
  static async getPendingOrders(restaurantId: number): Promise<PedidoEntity[]> {
    const result = await db.query(
      `SELECT o.*, COALESCE(json_agg(json_build_object('product_name', p.name, 'quantity', oi.quantity, 'unit_price', oi.unit_price_at_purchase)) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.restaurant_id = $1 AND o.status IN ('PENDING', 'CONFIRMED')
      GROUP BY o.id
      ORDER BY o.created_at ASC`,
      [restaurantId]
    );
    return result.rows;
  }

  /**
   * Estadísticas rápidas de órdenes
   */
  static async getOrderStats(restaurantId: number) {
    const result = await db.query(
      `SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending FROM orders WHERE restaurant_id = $1`,
      [restaurantId]
    );
    return result.rows[0];
  }

  // Alias para compatibilidad con tests legacy
  static async findActiveOrderById(id: number) {
    return this.getOrderById(id);
  }

  static async getPendingOrdersForChef(restaurantId: number): Promise<any[]> {
    const result = await db.query(
      `SELECT * FROM orders WHERE restaurant_id = $1 AND status IN ('PENDING', 'PREPARING') ORDER BY created_at ASC`,
      [restaurantId]
    );
    return result.rows;
  }

  static async updateStatus(orderId: number, status: string): Promise<any> {
    return this.updateOrderStatus(orderId, status);
  }
}