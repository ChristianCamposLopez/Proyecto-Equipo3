// models/daos/RankingDAO.ts
// Capa de persistencia — US019: Inteligencia de Negocio y Ranking

import { db } from '@/config/db';
import { RankedProduct } from '@/models/entities/RankedProduct';

/**
 * RankingDAO — Consultas SQL para ranking de productos por ventas.
 * Métodos:
 *  - getTopProducts(startDate, endDate, limit): Top N productos
 *  - getSalesByProduct(startDate, endDate): Todas las ventas por producto
 */
export class RankingDAO {

  /**
   * US019.1 + US019.2: Obtiene el ranking de productos por volumen de ventas.
   * US019.3: Filtra por rango de fechas.
   *
   * @param startDate - Fecha inicio (YYYY-MM-DD) o null para sin límite
   * @param endDate - Fecha fin (YYYY-MM-DD) o null para sin límite
   * @param limit - Cantidad máxima de resultados (default 5 para US019.2)
   */
  async getTopProducts(
    startDate: string | null,
    endDate: string | null,
    limit: number = 5
  ): Promise<RankedProduct[]> {
    let query = `
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        c.name AS category_name,
        COALESCE(SUM(oi.quantity), 0)::int AS total_sold,
        COALESCE(SUM(oi.quantity * oi.unit_price_at_purchase), 0)::numeric AS total_revenue
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'COMPLETED'
    `;

    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (startDate) {
      params.push(startDate);
      conditions.push(`o.created_at >= $${params.length}::date`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`o.created_at <= ($${params.length}::date + INTERVAL '1 day')`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += `
      GROUP BY p.id, p.name, c.name
      HAVING COALESCE(SUM(oi.quantity), 0) > 0
      ORDER BY total_sold DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const result = await db.query(query, params);
    return result.rows as RankedProduct[];
  }

  /**
   * US019.1: Obtiene todas las ventas desglosadas por producto (sin límite).
   * Útil para exportación completa (US019.4).
   */
  async getSalesByProduct(
    startDate: string | null,
    endDate: string | null
  ): Promise<RankedProduct[]> {
    return this.getTopProducts(startDate, endDate, 1000);
  }
}
