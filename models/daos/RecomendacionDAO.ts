// models/daos/RecomendacionDAO.ts
/*import { db } from "../../config/db";

// Definimos un tipo para el producto recomendado (opcional, pero ayuda)
export type RecomendacionProducto = {
  id: number;
  name: string;
  descripcion: string;
  base_price: string;
  image_display: string;
  score: number;
};

export class RecomendacionDAO {
  static async getTopRecommendations(
    userId: number,
    restaurantId: number
  ): Promise<RecomendacionProducto[]> {
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

      GROUP BY p.id
      ORDER BY score DESC
      LIMIT 5;
      `,
      [userId, restaurantId]
    );

    return result.rows;
  }
}*/

import { db } from "@/config/db";
import { RecomendacionEntity } from "../entities/RecomendacionEntity";

export class RecomendacionDAO {

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

      GROUP BY p.id
      ORDER BY score DESC
      LIMIT 5
      `,
      [userId, restaurantId]
    );

    return result.rows;
  }
}