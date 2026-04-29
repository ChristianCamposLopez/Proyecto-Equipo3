import { DisponibilidadDAO } from "@/models/daos/DisponibilidadDAO";
import { db } from "@/config/db";
import { DisponibilidadController } from "@/controllers/DisponibilidadController";
import { DELETE } from "@/app/api/platos/[id]/availability/[availabilityId]/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES (solo la base de datos)
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

describe("US020.3: Gestión de Menú – Eliminar horario (Pruebas Integrales)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (DisponibilidadDAO)
  // =========================================================
  describe("Capa de Persistencia (DisponibilidadDAO)", () => {
    describe("delete", () => {
      it("✓ debe eliminar un horario y retornar true si se eliminó una fila", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });
        const deleted = await DisponibilidadDAO.delete(42);
        expect(deleted).toBe(true);
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/DELETE\s+FROM\s+product_availability\s+WHERE\s+id\s*=\s*\$1/i);
        expect(params).toEqual([42]);
      });

      it("✓ debe retornar false si el ID no existe", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
        const deleted = await DisponibilidadDAO.delete(999);
        expect(deleted).toBe(false);
      });

      it("✗ debe propagar error de base de datos", async () => {
        const dbError = new Error("Permission denied");
        mockQuery.mockRejectedValueOnce(dbError);
        await expect(DisponibilidadDAO.delete(5)).rejects.toThrow("Permission denied");
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Controller + API Route)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    // Espías para interceptar los métodos del DAO sin mockear el módulo completo
    let spyDelete: jest.SpyInstance;

    beforeEach(() => {
      spyDelete = jest.spyOn(DisponibilidadDAO, 'delete');
    });

    afterEach(() => {
      spyDelete.mockRestore();
    });

    describe("DisponibilidadController.delete", () => {
      it("✓ debe eliminar horario existente y retornar true", async () => {
        spyDelete.mockResolvedValueOnce(true);
        const controller = new DisponibilidadController();
        const result = await controller.delete(10);
        expect(spyDelete).toHaveBeenCalledWith(10);
        expect(result).toBe(true);
      });

      it("✗ debe lanzar 'Not found' si delete retorna false", async () => {
        spyDelete.mockResolvedValueOnce(false);
        const controller = new DisponibilidadController();
        await expect(controller.delete(99)).rejects.toThrow("Not found");
      });
    });

    describe("API DELETE /api/platos/[id]/availability/[availabilityId]", () => {
      it("✓ debe retornar 200 y mensaje de éxito", async () => {
        spyDelete.mockResolvedValueOnce(true);
        const req = {} as NextRequest;
        const params = Promise.resolve({ availabilityId: "5" });
        const res = await DELETE(req, { params });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ message: "Deleted successfully" });
      });

      it("✗ debe retornar 400 si availabilityId no es número", async () => {
        const req = {} as NextRequest;
        const params = Promise.resolve({ availabilityId: "abc" });
        const res = await DELETE(req, { params });
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "Invalid id" });
      });

      it("✗ debe retornar 404 si el horario no existe (eliminación fallida)", async () => {
        spyDelete.mockResolvedValueOnce(false);
        const req = {} as NextRequest;
        const params = Promise.resolve({ availabilityId: "999" });
        const res = await DELETE(req, { params });
        expect(res.status).toBe(404);
        expect(await res.json()).toEqual({ error: "Not found" });
      });

      it("✗ debe retornar 400 para otros errores controlados", async () => {
        spyDelete.mockRejectedValueOnce(new Error("Some custom error"));
        const req = {} as NextRequest;
        const params = Promise.resolve({ availabilityId: "1" });
        const res = await DELETE(req, { params });
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "Some custom error" });
      });
    });
  });
});