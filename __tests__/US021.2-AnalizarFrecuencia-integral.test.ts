import { RecomendacionDAO } from "@/models/daos/RecomendacionDAO";
import { db } from "@/config/db";
import { RecomendacionController } from "@/controllers/RecomendacionController";
import { GET } from "@/app/api/recommendations/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES (solo la base de datos)
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

// Helper para crear NextRequest con URL
const createGetRequest = (url: string) => {
  return { url } as NextRequest;
};

describe("US021.2: Experiencia del Cliente – Analizar frecuencia (Pruebas Integrales)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (RecomendacionDAO)
  // =========================================================
  describe("Capa de Persistencia (RecomendacionDAO)", () => {
    describe("getTopRecommendations", () => {
      it("✓ debe retornar top 5 productos más comprados por el usuario en el restaurante", async () => {
        const fakeRows = [
          { id: 1, name: "Pizza", descripcion: "Mozzarella", base_price: 12, image_display: "/img.jpg", score: 10 },
          { id: 2, name: "Empanada", descripcion: "Carne", base_price: 3, image_display: "/img2.jpg", score: 5 },
        ];
        mockQuery.mockResolvedValueOnce({ rows: fakeRows });

        const result = await RecomendacionDAO.getTopRecommendations(1, 5);
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/SELECT\s+p\.id,\s*p\.name/i);
        expect(sql).toMatch(/SUM\(\s*oi\.quantity\s*\)\s+AS\s+score/i);
        expect(sql).toMatch(/FROM\s+pedido_historial\s+o/i);
        expect(sql).toMatch(/JOIN\s+pedido_items_historial\s+oi/i);
        expect(sql).toMatch(/WHERE\s+o\.customer_id\s*=\s*\$1/i);
        expect(sql).toMatch(/AND\s+c\.restaurant_id\s*=\s*\$2/i);
        expect(sql).toMatch(/AND\s+o\.status\s*=\s*'COMPLETED'/i);
        expect(sql).toMatch(/GROUP\s+BY\s+p\.id/i);
        expect(sql).toMatch(/ORDER\s+BY\s+score\s+DESC/i);
        expect(sql).toMatch(/LIMIT\s+5/i);
        expect(params).toEqual([1, 5]);
        expect(result).toEqual(fakeRows);
      });

      it("✓ debe retornar arreglo vacío si no hay historial", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        const result = await RecomendacionDAO.getTopRecommendations(999, 5);
        expect(result).toEqual([]);
      });

      it("✗ debe propagar error de base de datos", async () => {
        mockQuery.mockRejectedValueOnce(new Error("Timeout"));
        await expect(RecomendacionDAO.getTopRecommendations(1, 5))
          .rejects.toThrow("Timeout");
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Controller + API Route)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    let spyGetTop: jest.SpyInstance;

    beforeEach(() => {
      spyGetTop = jest.spyOn(RecomendacionDAO, 'getTopRecommendations');
    });

    afterEach(() => {
      spyGetTop.mockRestore();
    });

    describe("RecomendacionController.getRecommendationsForUser", () => {
      it("✓ debe devolver recomendaciones cuando hay historial", async () => {
        const recs = [{ id: 1, name: "Taco", score: 8 }];
        spyGetTop.mockResolvedValueOnce(recs);
        const controller = new RecomendacionController();
        const result = await controller.getRecommendationsForUser(1, 5);
        expect(spyGetTop).toHaveBeenCalledWith(1, 5);
        expect(result).toEqual(recs);
      });

      it("✓ debe devolver arreglo vacío si no hay recomendaciones", async () => {
        spyGetTop.mockResolvedValueOnce([]);
        const controller = new RecomendacionController();
        const result = await controller.getRecommendationsForUser(1, 5);
        expect(result).toEqual([]);
      });

      it("✗ debe propagar errores del DAO", async () => {
        spyGetTop.mockRejectedValueOnce(new Error("DB error"));
        const controller = new RecomendacionController();
        await expect(controller.getRecommendationsForUser(1, 5)).rejects.toThrow("DB error");
      });
    });

    describe("API GET /api/recommendations", () => {
      it("✓ debe retornar 200 con las recomendaciones", async () => {
        const fakeRecs = [{ id: 2, name: "Burger", score: 12 }];
        spyGetTop.mockResolvedValueOnce(fakeRecs);
        const req = createGetRequest("http://localhost/api/recommendations?restaurantId=10&customerId=123");
        const res = await GET(req);
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json).toEqual({ recommendations: fakeRecs });
        // El segundo argumento es el restaurantId (10), no el límite (fijo en 5 dentro del DAO)
        expect(spyGetTop).toHaveBeenCalledWith(expect.any(Number), 10);
      });

      it("✗ debe retornar 400 si falta restaurantId", async () => {
        const req = createGetRequest("http://localhost/api/recommendations");
        const res = await GET(req);
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "restaurantId and customerId are required" });
        expect(spyGetTop).not.toHaveBeenCalled();
      });
    });
  });
});