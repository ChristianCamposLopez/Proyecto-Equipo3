// lib/repositories/ranking.repository.ts
import { db } from '../../config/db';

export interface RankedProduct {
  product_id: number;
  product_name: string;
  total_quantity_sold: number;
}

export class RankingRepository {
  /**
   * Obtiene el ranking de productos más vendidos para un restaurante en un rango de fechas.
   * @param restaurantId - ID del restaurante
   * @param startDate - Fecha de inicio (inclusive)
   * @param endDate - Fecha de fin (inclusive)
   * @param limit - Número máximo de resultados (top N)
   * @returns Lista ordenada de productos con la cantidad vendida
   */
  async getTopSellingProducts(
    restaurantId: number,
    startDate: Date,
    endDate: Date,
    limit: number
  ): Promise<RankedProduct[]> {
    const query = `
    SELECT 
        p.id AS product_id,
        p.name AS product_name,
        SUM(oi.quantity) AS total_quantity_sold
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    INNER JOIN products p ON oi.product_id = p.id
    INNER JOIN categories c ON p.category_id = c.id
    WHERE 
      o.status = 'COMPLETED'
      AND o.created_at BETWEEN $1 AND $2
      AND o.restaurant_id = $3
      AND p.deleted_at IS NULL
    GROUP BY p.id, p.name
    ORDER BY total_quantity_sold DESC
    LIMIT $4
    `;

    const result = await db.query(query, [startDate, endDate, restaurantId, limit]);
    return result.rows;
  }

  // lib/repositories/ranking.repository.ts
  async getRestaurantName(restaurantId: number): Promise<string | null> {
    const query = `SELECT name FROM restaurants WHERE id = $1`;
    const result = await db.query(query, [restaurantId]);
    return result.rows[0]?.name || null;
  }
}