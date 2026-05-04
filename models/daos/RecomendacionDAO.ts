// models/daos/RecomendacionDAO.ts
/**
 * Capa de Persistencia para Sistema de Recomendación
 * US021: Recomendaciones de platillos según historial de pedidos
 */
import { db } from "@/config/db";
import { RecomendacionEntity } from "@/models/entities";

export class RecomendacionDAO {

  /**
   * Obtiene las mejores recomendaciones para un usuario basándose en su historial
   */
  static async getTopRecommendations(
    userId: number,
    restaurantId: number
  ): Promise<RecomendacionEntity[]> {

    const result = await db.query(
      `
      SELECT 
        p.id,
        p.name,
        p.descripcion,
        p.base_price,

        COALESCE(
          (
            SELECT pi.image_path
            FROM product_images pi
            WHERE pi.product_id = p.id
              AND pi.is_primary = TRUE
              AND pi.deleted_at IS NULL
            LIMIT 1
          ),
          '/images/default-product.png'
        ) AS image_display,

        SUM(oi.quantity) AS score

      FROM pedido_historial o
      JOIN pedido_items_historial oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      JOIN categories c ON p.category_id = c.id

    WHERE o.customer_id = $1
      AND c.restaurant_id = $2
      AND o.status = 'COMPLETED'
      AND p.is_active = TRUE
      AND p.deleted_at IS NULL
      AND p.stock > 0

        -- 🔥 LÓGICA DE DISPONIBILIDAD (US020) --
        AND (
          -- Caso A: El producto no tiene ninguna restricción horaria definida
          NOT EXISTS (
            SELECT 1 FROM product_availability 
            WHERE product_id = p.id
          )
          OR 
          -- Caso B: El producto tiene restricciones y hoy/ahora es válido
          EXISTS (
            SELECT 1 
            FROM product_availability pa 
            WHERE pa.product_id = p.id
              AND pa.day_of_week = EXTRACT(DOW FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')::int
              AND (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')::time BETWEEN pa.start_time AND pa.end_time
          )
        )
            
    GROUP BY p.id
    ORDER BY score DESC
    LIMIT 5
      `,
      [userId, restaurantId]
    );

    return result.rows;
  }
}