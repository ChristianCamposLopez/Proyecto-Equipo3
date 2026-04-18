// services/ReviewService.ts
// Capa de servicio — US016-017: Reseñas y Calificaciones

import { ReviewDAO } from '@/models/daos/ReviewDAO';
import { Review, ReviewStats } from '@/models/entities/Review';

/**
 * ReviewService — Lógica de negocio para reseñas.
 * US016: Reseñas visibles para clientes
 * US017: Dashboard analítico para admin
 */
export class ReviewService {
  private reviewDAO: ReviewDAO;

  constructor() {
    this.reviewDAO = new ReviewDAO();
  }

  /**
   * US016: Obtiene reseñas de un producto.
   */
  async getByProductId(productId: number): Promise<Review[]> {
    return this.reviewDAO.getByProductId(productId);
  }

  /**
   * US017: Obtiene todas las reseñas.
   */
  async getAll(): Promise<Review[]> {
    return this.reviewDAO.getAll();
  }

  /**
   * US016: Crea una nueva reseña con validaciones.
   */
  async create(
    productId: number,
    customerId: number,
    rating: number,
    comment: string
  ): Promise<Review> {
    // Validar rating
    if (rating < 1 || rating > 5) {
      throw new Error('La calificación debe estar entre 1 y 5');
    }

    // Validar comentario
    if (comment && comment.length > 500) {
      throw new Error('El comentario no puede exceder 500 caracteres');
    }

    return this.reviewDAO.create(productId, customerId, rating, comment);
  }

  /**
   * US017: Obtiene estadísticas por producto.
   */
  async getStats(): Promise<ReviewStats[]> {
    return this.reviewDAO.getStatsByProduct();
  }

  /**
   * US016: Obtiene promedio de calificación de un producto.
   */
  async getAverageRating(productId: number) {
    return this.reviewDAO.getAverageRating(productId);
  }
}
