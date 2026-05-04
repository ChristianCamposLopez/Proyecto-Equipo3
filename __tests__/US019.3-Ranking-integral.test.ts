/**
 * US019.3: Rango de fechas dinámico
 * Pruebas sobre la correcta filtración por fechas en el ranking.
 */

import { RankingDAO } from "@/models/daos/RankingDAO";
import { db } from "@/config/db";

jest.mock("@/config/db", () => ({
  db: {
    query: jest.fn(),
  },
}));

describe("US019.3 – Rango de fechas dinámico", () => {
  it("debe aplicar el filtro de fecha de inicio y fin en la persistencia", async () => {
    const startDate = new Date("2024-03-01T00:00:00Z");
    const endDate = new Date("2024-03-31T23:59:59Z");
    
    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await RankingDAO.getTopSellingProducts(1, startDate, endDate, 5);

    // Simplificamos el match para evitar fallos por espacios en blanco o saltos de línea
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("ph.created_at >= $1"),
      expect.arrayContaining([startDate, endDate])
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("ph.created_at <= $2"),
      expect.arrayContaining([startDate, endDate])
    );
  });
});