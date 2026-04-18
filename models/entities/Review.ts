// models/entities/Review.ts
// Entidad para US016-017: Reseñas y calificaciones

/**
 * Representa una reseña de un platillo hecha por un cliente.
 * Utilizada en la vista pública (US016) y el dashboard admin (US017).
 */
export interface Review {
  id: number;
  product_id: number;
  product_name?: string;
  customer_id: number;
  customer_name?: string;
  rating: number;       // 1-5
  comment: string;
  created_at: string;
}

/**
 * Estadísticas de calificación por producto para el panel admin (US017).
 */
export interface ReviewStats {
  product_id: number;
  product_name: string;
  avg_rating: number;
  total_reviews: number;
}
