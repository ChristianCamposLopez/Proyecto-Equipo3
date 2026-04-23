// controllers/RecomendacionController.ts
import { RecomendacionDAO } from "../models/daos/RecomendacionDAO";

export class RecomendacionController {
  async getRecommendationsForUser(userId: number, restaurantId: number) {
    // Ahora usamos el DAO directamente
    const recommendations = await RecomendacionDAO.getTopRecommendations(userId, restaurantId);

    // Regla de negocio: si no hay historial → no mostrar sección
    if (!recommendations || recommendations.length === 0) {
      return [];
    }

    return recommendations;
  }
}