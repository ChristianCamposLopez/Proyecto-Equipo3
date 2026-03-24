// lib/ranking.service.ts
import { RankingRepository, RankedProduct } from './repositories/ranking.repository';

export class RankingService {
  private repository: RankingRepository;

  constructor() {
    this.repository = new RankingRepository();
  }

  /**
   * Obtiene el ranking de productos más vendidos.
   * @param restaurantId - ID del restaurante
   * @param startDate - Fecha de inicio
   * @param endDate - Fecha de fin
   * @param limit - Top N (por defecto 5)
   * @returns Lista de productos con sus ventas
   */
  async getTopSellingProducts(
    restaurantId: number,
    startDate: Date,
    endDate: Date,
    limit: number = 5
  ): Promise<{ ranking: RankedProduct[]; restaurantName: string | null }> {
    // Validar que startDate sea anterior a endDate
    if (startDate >= endDate) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Validar que el rango no exceda 6 meses
    const diffMonths =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());

    if (diffMonths > 6) {
        throw new Error('El rango de fechas no puede exceder 6 meses');
    }

    // Validar que el límite sea positivo
    if (limit <= 0) {
      throw new Error('El límite debe ser un número positivo');
    }

    // Obtener el ranking del repositorio
     const ranking = await this.repository.getTopSellingProducts(
      restaurantId,
      startDate,
      endDate,
      limit
    );
    const restaurantName = await this.repository.getRestaurantName(restaurantId);

    return { ranking, restaurantName }; 
  }
}
