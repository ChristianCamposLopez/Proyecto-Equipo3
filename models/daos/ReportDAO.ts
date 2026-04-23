// models/daos/ReportDAO.ts — US015 & US006: Exportación de reportes
import { db } from '@/config/db';

export interface OrderDetailForExport {
  order_id: number;
  table_number: number;
  status: string;
  created_at: string;
  total_items: number;
  total_amount: number;
  items: Array<{
    product_name: string;
    category_name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
}

export interface SalesReportRow {
  date: string;
  order_id: number;
  table_number: number;
  status: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export class ReportDAO {
  /**
   * Obtener todas las órdenes con detalles para exportación (US015/US006)
   */
  async getOrdersForExport(
    restaurantId: number,
    startDate?: string,
    endDate?: string
  ): Promise<OrderDetailForExport[]> {
    try {
      let query = `
        SELECT 
          o.id as order_id,
          o.customer_id as table_number,
          o.status,
          o.created_at,
          COUNT(oi.id) as total_items,
          COALESCE(SUM(oi.quantity * oi.unit_price_at_purchase), 0) as total_amount
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.restaurant_id = $1
      `;

      const params: (string | number)[] = [restaurantId];

      if (startDate) {
        query += ` AND o.created_at >= $${params.length + 1}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND o.created_at <= $${params.length + 1}`;
        params.push(endDate);
      }

      query += ` GROUP BY o.id, o.customer_id, o.status, o.created_at
                 ORDER BY o.created_at DESC`;

      const ordersResult = await db.query(query, params);
      const orders = ordersResult.rows;

      // Obtener items de cada orden
      const ordersWithItems: OrderDetailForExport[] = [];

      for (const order of orders) {
        const itemsResult = await db.query(
          `SELECT 
            p.name as product_name,
            c.name as category_name,
            oi.quantity,
            oi.unit_price_at_purchase,
            (oi.quantity * oi.unit_price_at_purchase) as total
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           JOIN categories c ON p.category_id = c.id
           WHERE oi.order_id = $1`,
          [order.order_id]
        );

        ordersWithItems.push({
          order_id: order.order_id,
          table_number: order.table_number,
          status: order.status,
          created_at: order.created_at,
          total_items: order.total_items,
          total_amount: parseFloat(order.total_amount),
          items: itemsResult.rows
        });
      }

      return ordersWithItems;
    } catch (error) {
      console.error('[ReportDAO.getOrdersForExport]', error);
      throw error;
    }
  }

  /**
   * Obtener reporte de ventas en formato plano para CSV/Excel
   */
  async getSalesReportFlat(
    restaurantId: number,
    startDate?: string,
    endDate?: string
  ): Promise<SalesReportRow[]> {
    try {
      let query = `
        SELECT 
          DATE(o.created_at) as date,
          o.id as order_id,
          o.customer_id as table_number,
          o.status,
          p.name as product_name,
          oi.quantity,
          oi.unit_price_at_purchase,
          (oi.quantity * oi.unit_price_at_purchase) as subtotal
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         WHERE o.restaurant_id = $1
      `;

      const params: (string | number)[] = [restaurantId];

      if (startDate) {
        query += ` AND o.created_at >= $${params.length + 1}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND o.created_at <= $${params.length + 1}`;
        params.push(endDate);
      }

      query += ` ORDER BY o.created_at DESC, order_id`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('[ReportDAO.getSalesReportFlat]', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de ventas por fecha (US006: Reporte de ventas)
   */
  async getDailySalesReport(
    restaurantId: number,
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{
      date: string;
      total_orders: number;
      completed_orders: number;
      cancelled_orders: number;
      total_revenue: number;
      avg_order_value: number;
    }>
  > {
    try {
      let query = `
        SELECT 
          DATE(o.created_at) as date,
          COUNT(*) as total_orders,
          COUNT(CASE WHEN o.status = 'COMPLETED' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) as cancelled_orders,
          COALESCE(SUM(
            (SELECT SUM(oi.quantity * oi.unit_price_at_purchase) 
             FROM order_items oi 
             WHERE oi.order_id = o.id)
          ), 0) as total_revenue,
          ROUND(COALESCE(AVG(
            (SELECT SUM(oi.quantity * oi.unit_price_at_purchase) 
             FROM order_items oi 
             WHERE oi.order_id = o.id)
          ), 0)::numeric, 2) as avg_order_value
         FROM orders o
         WHERE o.restaurant_id = $1
      `;

      const params: (string | number)[] = [restaurantId];

      if (startDate) {
        query += ` AND o.created_at >= $${params.length + 1}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND o.created_at <= $${params.length + 1}`;
        params.push(endDate);
      }

      query += ` GROUP BY DATE(o.created_at)
                 ORDER BY date DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('[ReportDAO.getDailySalesReport]', error);
      throw error;
    }
  }

  /**
   * Obtener ventas diarias legado (compatible con código existente)
   */
  static async getDailySales(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          DATE(o.created_at) as day,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(
            (SELECT SUM(oi.quantity * oi.unit_price_at_purchase) 
             FROM order_items oi 
             WHERE oi.order_id = o.id)
          ), 0) as total_sales,
          ROUND(COALESCE(AVG(
            (SELECT SUM(oi.quantity * oi.unit_price_at_purchase) 
             FROM order_items oi 
             WHERE oi.order_id = o.id)
          ), 0)::numeric, 2) as average_ticket
        FROM orders o
        WHERE o.status != 'CANCELLED'
        GROUP BY DATE(o.created_at)
        ORDER BY day DESC
      `;

      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('[ReportDAO.getDailySales]', error);
      throw error;
    }
  }
}