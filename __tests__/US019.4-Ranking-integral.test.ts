/**
 * US019.4: Exportación de ranking
 * Pruebas sobre la estructura de respuesta para reportes.
 */

import { RankingService } from "@/services/RankingService";
import { RankingDAO } from "@/models/daos/RankingDAO";

jest.mock("@/models/daos/RankingDAO");

describe("US019.4 – Datos para exportación", () => {
  let service: RankingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RankingService();
  });

  it("debe devolver un objeto RankingResponse con los campos necesarios para exportar", async () => {
    const mockRanking = [
      { product_id: 1, product_name: "Platillo A", total_quantity_sold: 100 },
      { product_id: 2, product_name: "Platillo B", total_quantity_sold: 80 }
    ];

    (RankingDAO.getTopSellingProducts as jest.Mock).mockResolvedValue(mockRanking);
    (RankingDAO.getRestaurantName as jest.Mock).mockResolvedValue("Restaurante Test");

    const result = await service.getTopSellingProducts(1, new Date("2024-01-01"), new Date("2024-01-02"), 2);

    expect(result).toHaveProperty("ranking");
    expect(result).toHaveProperty("restaurantName");
    expect(result.ranking).toHaveLength(2);
    expect(result.restaurantName).toBe("Restaurante Test");
  });
});