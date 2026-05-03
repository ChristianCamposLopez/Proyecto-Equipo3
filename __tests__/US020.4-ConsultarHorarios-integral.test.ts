import { DisponibilidadDAO } from "@/models/daos/DisponibilidadDAO";
import { db } from "@/config/db";
import { DisponibilidadService } from "@/services/DisponibilidadService";
import { GET } from "@/app/api/platos/[id]/availability/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES (solo la base de datos)
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

describe("US020.4: Gestión de Menú – Consultar horarios (Pruebas Integrales)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (DisponibilidadDAO)
  // =========================================================
  describe("Capa de Persistencia (DisponibilidadDAO)", () => {
    describe("getByProductId", () => {
      it("✓ debe retornar todos los horarios de un producto ordenados por día y hora", async () => {
        const schedules = [
          { id: 1, product_id: 5, day_of_week: 1, start_time: "10:00", end_time: "12:00" },
          { id: 2, product_id: 5, day_of_week: 3, start_time: "15:00", end_time: "18:00" },
        ];
        mockQuery.mockResolvedValueOnce({ rows: schedules });

        const result = await DisponibilidadDAO.getByProductId(5);
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/WHERE\s+product_id\s*=\s*\$1/i);
        expect(sql).toMatch(/ORDER\s+BY\s+day_of_week\s*,\s*start_time/i);
        expect(params).toEqual([5]);
        expect(result).toEqual(schedules);
      });

      it("✓ debe retornar arreglo vacío si el producto no tiene horarios", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        const result = await DisponibilidadDAO.getByProductId(99);
        expect(result).toEqual([]);
      });

      it("✗ debe propagar error de base de datos", async () => {
        const dbError = new Error("Timeout");
        mockQuery.mockRejectedValueOnce(dbError);
        await expect(DisponibilidadDAO.getByProductId(1)).rejects.toThrow("Timeout");
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Service + API Route)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    // Espía para interceptar el método del DAO sin mockear todo el módulo
    let spyGetByProductId: jest.SpyInstance;

    beforeEach(() => {
      spyGetByProductId = jest.spyOn(DisponibilidadDAO, 'getByProductId');
    });

    afterEach(() => {
      spyGetByProductId.mockRestore();
    });

    describe("DisponibilidadService.getByProductoEntity", () => {
      it("✓ debe devolver los horarios de un producto", async () => {
        const fakeSchedules = [{ id: 1, day_of_week: 1, start_time: "08:00", end_time: "12:00" }];
        spyGetByProductId.mockResolvedValueOnce(fakeSchedules);
        const controller = new DisponibilidadService();
        const result = await controller.getByProductoEntity(7);
        expect(spyGetByProductId).toHaveBeenCalledWith(7);
        expect(result).toEqual(fakeSchedules);
      });

      it("✗ debe propagar errores del DAO", async () => {
        spyGetByProductId.mockRejectedValueOnce(new Error("DB error"));
        const controller = new DisponibilidadService();
        await expect(controller.getByProductoEntity(1)).rejects.toThrow("DB error");
      });
    });

    describe("API GET /api/platos/[id]/availability", () => {
      it("✓ debe retornar 200 con la lista de horarios", async () => {
        const schedules = [{ id: 2, day_of_week: 2, start_time: "14:00", end_time: "16:00" }];
        spyGetByProductId.mockResolvedValueOnce(schedules);

        const req = {} as NextRequest;
        const params = Promise.resolve({ id: "3" });
        const res = await GET(req, { params });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ availability: schedules });
        expect(spyGetByProductId).toHaveBeenCalledWith(3);
      });

      it("✗ debe retornar 400 si el ID del producto no es número", async () => {
        const req = {} as NextRequest;
        const params = Promise.resolve({ id: "abc" });
        const res = await GET(req, { params });
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "Invalid product id" });
      });

      it("✗ debe retornar 500 si el controlador lanza error", async () => {
        spyGetByProductId.mockRejectedValueOnce(new Error("Unexpected"));
        const req = {} as NextRequest;
        const params = Promise.resolve({ id: "1" });
        const res = await GET(req, { params });
        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: "Internal server error" });
      });
    });
  });
});