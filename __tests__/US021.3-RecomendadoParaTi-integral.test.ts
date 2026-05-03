import { RecomendacionDAO } from "@/models/daos/RecomendacionDAO";
import { db } from "@/config/db";
import { RecomendacionService } from "@/services/RecomendacionService";
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
const createGetRequest = (url: string) => ({ url } as NextRequest);

describe("US021.3: Experiencia del Cliente – Mostrar 'Recomendado para ti' (Pruebas Integrales)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (RecomendacionDAO)
  // =========================================================
  describe("Capa de Persistencia (RecomendacionDAO)", () => {
    describe("getTopRecommendations", () => {
      it("✓ debe retornar top N productos más comprados por el usuario en el restaurante", async () => {
        const fakeRows = [
          { id: 1, name: "Pizza", descripcion: "Mozzarella", base_price: 12, image_display: "/pizza.jpg", score: 10 },
          { id: 2, name: "Empanada", descripcion: "Carne", base_price: 3, image_display: "/empanada.jpg", score: 5 },
        ];
        mockQuery.mockResolvedValueOnce({ rows: fakeRows });

        const result = await RecomendacionDAO.getTopRecommendations(1, 5);
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/SELECT\s+p\.id,\s*p\.name/i);
        expect(sql).toMatch(/SUM\(\s*oi\.quantity\s*\)\s+AS\s+score/i);
        expect(sql).toMatch(/WHERE\s+o\.customer_id\s*=\s*\$1/i);
        expect(sql).toMatch(/AND\s+c\.restaurant_id\s*=\s*\$2/i);
        expect(sql).toMatch(/LIMIT\s+5/i);
        expect(params).toEqual([1, 5]);
        expect(result).toEqual(fakeRows);
      });

      it("✓ debe retornar array vacío si no hay historial", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        const result = await RecomendacionDAO.getTopRecommendations(999, 5);
        expect(result).toEqual([]);
      });

      it("✗ debe propagar error de base de datos", async () => {
        mockQuery.mockRejectedValueOnce(new Error("Timeout"));
        await expect(RecomendacionDAO.getTopRecommendations(1, 5)).rejects.toThrow("Timeout");
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Service + API)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    let spyGetTop: jest.SpyInstance;

    beforeEach(() => {
      spyGetTop = jest.spyOn(RecomendacionDAO, 'getTopRecommendations');
    });

    afterEach(() => {
      spyGetTop.mockRestore();
    });

    describe("RecomendacionService.getRecommendationsForUser", () => {
      it("✓ debe devolver recomendaciones cuando hay historial", async () => {
        const recs = [{ id: 1, name: "Taco", score: 8 }];
        spyGetTop.mockResolvedValueOnce(recs);
        const controller = new RecomendacionService();
        const result = await controller.getRecommendationsForUser(1, 5);
        expect(spyGetTop).toHaveBeenCalledWith(1, 5);
        expect(result).toEqual(recs);
      });

      it("✓ debe devolver array vacío si no hay recomendaciones", async () => {
        spyGetTop.mockResolvedValueOnce([]);
        const controller = new RecomendacionService();
        const result = await controller.getRecommendationsForUser(1, 5);
        expect(result).toEqual([]);
      });

      it("✗ debe propagar errores del DAO", async () => {
        spyGetTop.mockRejectedValueOnce(new Error("DB error"));
        const controller = new RecomendacionService();
        await expect(controller.getRecommendationsForUser(1, 5)).rejects.toThrow("DB error");
      });
    });

    describe("API GET /api/recommendations", () => {
      it("✓ debe retornar 200 con las recomendaciones (usuario autenticado)", async () => {
        const fakeRecs = [{ id: 2, name: "Burger", base_price: 8, image_display: "/burger.jpg" }];
        spyGetTop.mockResolvedValueOnce(fakeRecs);
        const req = createGetRequest("http://localhost/api/recommendations?restaurantId=10&customerId=1");
        const res = await GET(req);
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json).toEqual({ recommendations: fakeRecs });
        // Se espera que el controlador reciba customerId desde la sesión (mockeado a 1) y restaurantId=10
        expect(spyGetTop).toHaveBeenCalledWith(1, 10);
      });

      it("✗ debe retornar 400 si falta restaurantId", async () => {
        const req = createGetRequest("http://localhost/api/recommendations?customerId=123");
        const res = await GET(req);
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "restaurantId and customerId are required" });
        expect(spyGetTop).not.toHaveBeenCalled();
      });
    });
  });
});