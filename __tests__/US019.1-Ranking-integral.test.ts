/**
 * US019.1: Calcular ranking de los platos más vendidos
 * Pruebas sobre la lógica de negocio y persistencia (vía DAOs estáticos).
 */

import { RankingDAO } from "@/models/daos/RankingDAO";
import { RankingService } from "@/services/RankingService";
import { db } from "@/config/db";

// Mock del objeto db
jest.mock("@/config/db", () => ({
  db: {
    query: jest.fn(),
  },
}));

describe("US019.1 – Calcular ranking de ventas (persistencia y lógica)", () => {
  let service: RankingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RankingService();
  });

  describe("Persistencia (RankingDAO)", () => {
    it("debe construir la consulta SQL correcta para el ranking", async () => {
      const mockRows = [{ product_id: 1, product_name: "Taco", total_quantity_sold: 50 }];
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: mockRows });

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await RankingDAO.getTopSellingProducts(1, startDate, endDate, 5);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("SUM(iph.quantity)"),
        [startDate, endDate, 1, 5]
      );
      expect(result).toEqual(mockRows);
    });
  });

  describe("Lógica de negocio (RankingService)", () => {
    it("debe invocar al DAO y devolver el ranking calculado", async () => {
      const mockRanking = [{ product_id: 1, product_name: "Taco", total_quantity_sold: 30 }];
      
      const spyTop = jest.spyOn(RankingDAO, 'getTopSellingProducts').mockResolvedValue(mockRanking);
      const spyName = jest.spyOn(RankingDAO, 'getRestaurantName').mockResolvedValue('Taquería');

      const result = await service.getTopSellingProducts(1, new Date("2024-01-01"), new Date("2024-01-02"), 5);

      expect(result.ranking).toEqual(mockRanking);
      expect(result.restaurantName).toBe("Taquería");
      
      spyTop.mockRestore();
      spyName.mockRestore();
    });
  });
});