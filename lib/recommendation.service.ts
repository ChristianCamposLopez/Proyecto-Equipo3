// lib/services/recommendation.service.ts

import * as repo from "../lib/repositories/recommendation.repository";

export async function getRecommendationsForUser(userId: number, restaurantId: number) {
  const recommendations = await repo.getTopRecommendations(userId, restaurantId);

  // Regla: si no hay historial → no mostrar sección
  if (!recommendations || recommendations.length === 0) {
    return [];
  }

  return recommendations;
}