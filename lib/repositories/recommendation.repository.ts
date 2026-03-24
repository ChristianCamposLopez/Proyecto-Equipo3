// lib/repositories/recommendation.repository.ts

import { db } from "@/config/db";

export async function getTopRecommendations(userId: number, restaurantId: number) {
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

        cr.score

    FROM customer_recommendations cr
    JOIN products p ON p.id = cr.product_id
    JOIN categories c ON p.category_id = c.id

    WHERE cr.customer_id = $1
      AND c.restaurant_id = $2

      -- Estado del producto
      AND p.is_active = TRUE
      AND p.deleted_at IS NULL

      -- Stock disponible
      AND p.stock > 0

    ORDER BY cr.rank ASC
    LIMIT 5;
    `,
    [userId, restaurantId]
  );

  return result.rows;
}