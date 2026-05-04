/**
 * US019.2: Mostrar top 5 (límite y validaciones)
 * Pruebas sobre la limitación de resultados y validación de parámetros.
 */

import { RankingDAO } from "@/models/daos/RankingDAO";
import { RankingService } from "@/services/RankingService";
import { db } from "@/config/db";

jest.mock("@/config/db", () => ({
  db: {
    query: jest.fn(),
  },
}));

describe("US019.2 – Mostrar top 5 (límite y validaciones)", () => {
  let service: RankingService;
  const validStart = new Date("2024-01-01");
  const validEnd = new Date("2024-01-02");

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RankingService();
  });

  describe("Persistencia (RankingDAO) – respeta el límite", () => {
    it("debe limitar los resultados al valor limit proporcionado", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await RankingDAO.getTopSellingProducts(1, validStart, validEnd, 5);
      const params = (db.query as jest.Mock).mock.calls[0][1];
      expect(params[3]).toBe(5);
    });
  });

  describe("Lógica de negocio (RankingService) – top 5 por defecto y validaciones", () => {
    it("debe rechazar límites negativos o cero", async () => {
      await expect(service.getTopSellingProducts(1, validStart, validEnd, 0))
        .rejects.toThrow("El límite debe ser un número positivo");
    });

    it("debe rechazar rangos de fecha mayores a 6 meses", async () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-08-01");
      await expect(service.getTopSellingProducts(1, start, end, 5))
        .rejects.toThrow("El rango de fechas no puede exceder 6 meses");
    });
  });
});