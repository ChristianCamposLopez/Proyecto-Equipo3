// models/daos/StatsDAO.ts
/**
 * Capa de Persistencia para Estadísticas y Reportes
 * US006: Reportes de ventas diarias
 * US019: Top products statistics
 */
import { db } from '@/config/db';

export interface TopProductoEntity {
  product_id: number;
  name: string;
  category_name: string;
  total_quantity: number;
  total_revenue: number;
  times_ordered: number;
  avg_quantity_per_order: number;
}

export interface DailySalesStats {
  date: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  orders_by_status: { [key: string]: number };
}

export interface RevenueByCategory {
  category_name: string;
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
}

export class StatsDAO {
  /**
   * Obtener los platillos más vendidos en un período
   */
  static async getTopProducts(
    restaurantId: number,
    days: number = 30,
    limit: number = 10
  ): Promise<TopProductoEntity[]> {
    try {
      const result = await db.query(
        `SELECT 
          p.id as product_id,
          p.name,
          c.name as category_name,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.quantity * oi.unit_price_at_purchase) as total_revenue,
          COUNT(DISTINCT oi.order_id) as times_ordered,
          ROUND(AVG(oi.quantity)::numeric, 2) as avg_quantity_per_order
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN categories c ON p.category_id = c.id
         JOIN orders o ON oi.order_id = o.id
         WHERE o.restaurant_id = $1
         AND o.created_at >= NOW() - INTERVAL '${days} days'
         AND o.status != 'CANCELLED'
         GROUP BY p.id, p.name, c.name
         ORDER BY total_revenue DESC
         LIMIT $2`,
        [restaurantId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('[StatsDAO.getTopProducts]', error);
      throw error;
    }
  }

  /**
   * Estadísticas de ventas diarias
   */
  static async getDailySalesStats(
    restaurantId: number,
    days: number = 30
  ): Promise<DailySalesStats[]> {
    try {
      const result = await db.query(
        `SELECT 
          DATE(o.created_at) as date,
          COUNT(*) as total_orders,
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
         AND o.created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY DATE(o.created_at)
         ORDER BY date DESC`,
        [restaurantId]
      );
      return result.rows.map(row => ({
        ...row,
        orders_by_status: {} // Se llena en el controlador si es necesario
      }));
    } catch (error) {
      console.error('[StatsDAO.getDailySalesStats]', error);
      throw error;
    }
  }

  /**
   * Ingresos por categoría
   */
  static async getRevenueByCategory(
    restaurantId: number,
    days: number = 30
  ): Promise<RevenueByCategory[]> {
    try {
      const result = await db.query(
        `SELECT 
          c.name as category_name,
          COALESCE(SUM(oi.quantity * oi.unit_price_at_purchase), 0) as total_revenue,
          COUNT(DISTINCT o.id) as total_orders,
          ROUND(COALESCE(AVG(
            (SELECT SUM(oi2.quantity * oi2.unit_price_at_purchase) 
             FROM order_items oi2 
             WHERE oi2.order_id = o.id)
          ), 0)::numeric, 2) as avg_order_value
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         JOIN categories c ON p.category_id = c.id
         WHERE o.restaurant_id = $1
         AND o.created_at >= NOW() - INTERVAL '${days} days'
         AND o.status != 'CANCELLED'
         GROUP BY c.name
         ORDER BY total_revenue DESC`,
        [restaurantId]
      );
      return result.rows;
    } catch (error) {
      console.error('[StatsDAO.getRevenueByCategory]', error);
      throw error;
    }
  }

  /**
   * Resumen general de ventas
   */
  static async getSalesOverview(
    restaurantId: number,
    days: number = 30
  ): Promise<{
    total_revenue: number;
    total_orders: number;
    avg_order_value: number;
    completed_orders: number;
    cancelled_orders: number;
  }> {
    try {
      const result = await db.query(
        `SELECT 
          COALESCE(SUM(
            (SELECT SUM(oi.quantity * oi.unit_price_at_purchase) 
             FROM order_items oi 
             WHERE oi.order_id = o.id)
          ), 0) as total_revenue,
          COUNT(*) as total_orders,
          ROUND(COALESCE(AVG(
            (SELECT SUM(oi.quantity * oi.unit_price_at_purchase) 
             FROM order_items oi 
             WHERE oi.order_id = o.id)
          ), 0)::numeric, 2) as avg_order_value,
          COUNT(CASE WHEN o.status = 'COMPLETED' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) as cancelled_orders
         FROM orders o
         WHERE o.restaurant_id = $1
         AND o.created_at >= NOW() - INTERVAL '${days} days'`,
        [restaurantId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('[StatsDAO.getSalesOverview]', error);
      throw error;
    }
  }
}

