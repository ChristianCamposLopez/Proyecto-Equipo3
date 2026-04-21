// models/daos/OrderDAO.ts
import { db } from '@/config/db';
import { Order, OrderItem, OrderWithItems } from '../entities/Order';

export class OrderDAO {
  // Obtener una orden por ID
  async getOrderById(orderId: number): Promise<Order | null> {
    const result = await db.query(
      `SELECT id, customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at
       FROM orders
       WHERE id = $1`,
      [orderId]
    );
    if (result.rowCount === 0) return null;
    return result.rows[0] as Order;
  }

  // Obtener todas las órdenes de un restaurante
  async getOrdersByRestaurant(restaurantId: number): Promise<Order[]> {
    const result = await db.query(
      `SELECT id, customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at
       FROM orders
       WHERE restaurant_id = $1
       ORDER BY created_at DESC`,
      [restaurantId]
    );
    return result.rows as Order[];
  }

  // Obtener órdenes por estado
  async getOrdersByStatus(restaurantId: number, status: string): Promise<Order[]> {
    const result = await db.query(
      `SELECT id, customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at
       FROM orders
       WHERE restaurant_id = $1 AND status = $2
       ORDER BY created_at DESC`,
      [restaurantId, status]
    );
    return result.rows as Order[];
  }

  // Obtener orden con sus items
  async getOrderWithItems(orderId: number): Promise<OrderWithItems | null> {
    const orderResult = await db.query(
      `SELECT id, customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at
       FROM orders
       WHERE id = $1`,
      [orderId]
    );

    if (orderResult.rowCount === 0) return null;

    const order = orderResult.rows[0] as Order;

    const itemsResult = await db.query(
      `SELECT id, order_id, product_id, quantity, unit_price_at_purchase
       FROM order_items
       WHERE order_id = $1`,
      [orderId]
    );

    return {
      ...order,
      items: itemsResult.rows as OrderItem[]
    };
  }

  // US011: Confirmar un pedido (cambiar estado de PENDING a CONFIRMED)
  async confirmOrder(orderId: number): Promise<Order> {
    const order = await this.getOrderById(orderId);
    
    if (!order) {
      throw new Error(`Pedido con id ${orderId} no encontrado`);
    }

    if (order.status !== 'PENDING') {
      throw new Error(`No se puede confirmar un pedido con estado ${order.status}. Solo PENDING puede confirmarse`);
    }

    const result = await db.query(
      `UPDATE orders
       SET status = 'CONFIRMED', confirmed_at = NOW()
       WHERE id = $1
       RETURNING id, customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at`,
      [orderId]
    );

    if (result.rowCount === 0) {
      throw new Error(`No se pudo confirmar el pedido ${orderId}`);
    }

    return result.rows[0] as Order;
  }

  // Actualizar estado de un pedido
  async updateOrderStatus(orderId: number, newStatus: string): Promise<Order> {
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Estado inválido: ${newStatus}`);
    }

    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Pedido con id ${orderId} no encontrado`);
    }

    const result = await db.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2
       RETURNING id, customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at`,
      [newStatus, orderId]
    );

    if (result.rowCount === 0) {
      throw new Error(`No se pudo actualizar el estado del pedido ${orderId}`);
    }

    return result.rows[0] as Order;
  }

  // Cancelar un pedido
  async cancelOrder(orderId: number, reason?: string): Promise<Order> {
    const order = await this.getOrderById(orderId);
    
    if (!order) {
      throw new Error(`Pedido con id ${orderId} no encontrado`);
    }

    if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
      throw new Error(`No se puede cancelar un pedido con estado ${order.status}`);
    }

    const result = await db.query(
      `UPDATE orders
       SET status = 'CANCELLED'
       WHERE id = $1
       RETURNING id, customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at`,
      [orderId]
    );

    if (result.rowCount === 0) {
      throw new Error(`No se pudo cancelar el pedido ${orderId}`);
    }

    return result.rows[0] as Order;
  }

  // Obtener órdenes pendientes de un restaurante
  async getPendingOrders(restaurantId: number): Promise<Order[]> {
    const result = await db.query(
      `SELECT id, customer_id, restaurant_id, delivery_address_json, status, total_amount, created_at
       FROM orders
       WHERE restaurant_id = $1 AND status IN ('PENDING', 'CONFIRMED')
       ORDER BY created_at ASC`,
      [restaurantId]
    );
    return result.rows as Order[];
  }

  // Obtener estadísticas de órdenes
  async getOrderStats(restaurantId: number): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    completed: number;
    cancelled: number;
  }> {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'PREPARING' THEN 1 END) as preparing,
        COUNT(CASE WHEN status = 'READY' THEN 1 END) as ready,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled
       FROM orders
       WHERE restaurant_id = $1`,
      [restaurantId]
    );

    const row = result.rows[0];
    return {
      total: parseInt(row.total),
      pending: parseInt(row.pending),
      confirmed: parseInt(row.confirmed),
      preparing: parseInt(row.preparing),
      ready: parseInt(row.ready),
      completed: parseInt(row.completed),
      cancelled: parseInt(row.cancelled)
    };
  }
}
