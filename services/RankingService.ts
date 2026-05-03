// controllers/RankingController.ts
import { RankingDAO } from '@/models/daos/RankingDAO';
import { RankingResponse } from '@/models/entities/RankingEntities';

export class RankingService {

  async getTopSellingProducts(
    restaurantId: number,
    startDate: Date,
    endDate: Date,
    limit: number = 5
  ): Promise<RankingResponse> {

    // Validaciones
    if (startDate >= endDate) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    const diffMonths =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    if (diffMonths > 6) {
      throw new Error('El rango de fechas no puede exceder 6 meses');
    }

    if (limit <= 0) {
      throw new Error('El límite debe ser un número positivo');
    }

    const ranking = await RankingDAO.getTopSellingProducts(
      restaurantId,
      startDate,
      endDate,
      limit
    );

    const restaurantName = await RankingDAO.getRestaurantName(restaurantId);

    return { ranking, restaurantName };
  }
}