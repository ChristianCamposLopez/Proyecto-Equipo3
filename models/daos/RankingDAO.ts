// models/daos/RankingDAO.ts
/**
 * Capa de Persistencia para Ranking de Ventas
 * US019: Calcular ranking de los platos más vendidos
 */
import { db } from '@/config/db';
import { RankedProductoEntity } from '@/models/entities';

export class RankingDAO {

  static async getTopSellingProducts(
    restaurantId: number,
    startDate: Date,
    endDate: Date,
    limit: number
  ): Promise<RankedProductoEntity[]> {

    const query = `
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        SUM(iph.quantity) AS total_quantity_sold
      FROM pedido_items_historial iph
      INNER JOIN pedido_historial ph 
        ON iph.order_id = ph.id
      INNER JOIN products p 
        ON iph.product_id = p.id
      WHERE 
        ph.status = 'COMPLETED'
        AND ph.created_at >= $1
        AND ph.created_at <= $2
        AND ph.restaurant_id = $3
        AND p.deleted_at IS NULL
      GROUP BY p.id, p.name
      ORDER BY total_quantity_sold DESC
      LIMIT $4
    `;

    const result = await db.query(query, [
      startDate,
      endDate,
      restaurantId,
      limit
    ]);

    return result.rows;
  }

  static async getRestaurantName(restaurantId: number): Promise<string | null> {
    const query = `SELECT name FROM restaurants WHERE id = $1`;
    const result = await db.query(query, [restaurantId]);
    return result.rows[0]?.name || null;
  }
}