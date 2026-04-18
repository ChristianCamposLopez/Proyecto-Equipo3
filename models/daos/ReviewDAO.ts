// models/daos/ReviewDAO.ts
// Capa de persistencia — US016-017: Reseñas y Calificaciones

import { db } from '@/config/db';
import { Review, ReviewStats } from '@/models/entities/Review';

/**
 * ReviewDAO — CRUD de reseñas y consultas estadísticas.
 * US016: Vista de reseñas para clientes
 * US017: Dashboard analítico de calificaciones para admin
 */
export class ReviewDAO {

  /**
   * US016: Obtiene todas las reseñas de un producto específico.
   */
  async getByProductId(productId: number): Promise<Review[]> {
    const result = await db.query(`
      SELECT
        r.id,
        r.product_id,
        p.name AS product_name,
        r.customer_id,
        u.full_name AS customer_name,
        r.rating,
        r.comment,
        r.created_at
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.customer_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `, [productId]);
    return result.rows as Review[];
  }

  /**
   * US017: Obtiene todas las reseñas del sistema (para panel admin).
   */
  async getAll(): Promise<Review[]> {
    const result = await db.query(`
      SELECT
        r.id,
        r.product_id,
        p.name AS product_name,
        r.customer_id,
        u.full_name AS customer_name,
        r.rating,
        r.comment,
        r.created_at
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.customer_id = u.id
      ORDER BY r.created_at DESC
    `);
    return result.rows as Review[];
  }

  /**
   * US016: Crea una nueva reseña.
   */
  async create(
    productId: number,
    customerId: number,
    rating: number,
    comment: string
  ): Promise<Review> {
    const result = await db.query(`
      INSERT INTO reviews (product_id, customer_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING id, product_id, customer_id, rating, comment, created_at
    `, [productId, customerId, rating, comment]);
    return result.rows[0] as Review;
  }

  /**
   * US017: Obtiene estadísticas de calificación por producto.
   */
  async getStatsByProduct(): Promise<ReviewStats[]> {
    const result = await db.query(`
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
        COUNT(r.id)::int AS total_reviews
      FROM products p
      LEFT JOIN reviews r ON r.product_id = p.id
      GROUP BY p.id, p.name
      HAVING COUNT(r.id) > 0
      ORDER BY avg_rating DESC
    `);
    return result.rows as ReviewStats[];
  }

  /**
   * US016: Obtiene el promedio de calificación de un producto.
   */
  async getAverageRating(productId: number): Promise<{ avg_rating: number; total_reviews: number }> {
    const result = await db.query(`
      SELECT
        ROUND(AVG(rating)::numeric, 1) AS avg_rating,
        COUNT(id)::int AS total_reviews
      FROM reviews
      WHERE product_id = $1
    `, [productId]);
    return result.rows[0] || { avg_rating: 0, total_reviews: 0 };
  }
}
