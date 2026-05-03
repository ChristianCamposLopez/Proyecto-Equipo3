import { DisponibilidadDAO } from "@/models/daos/DisponibilidadDAO";
import { db } from "@/config/db";
import { DisponibilidadService } from "@/services/DisponibilidadService";
import { PATCH } from "@/app/api/platos/[id]/availability/[availabilityId]/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES (solo la base de datos)
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

// Helper para simular NextRequest con body JSON
const createPatchRequest = (body: any) => {
  return {
    json: async () => body,
  } as NextRequest;
};

describe("US020.2: Gestión de Menú – Editar horario (Pruebas Integrales)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (DisponibilidadDAO)
  // =========================================================
  describe("Capa de Persistencia (DisponibilidadDAO)", () => {
    describe("update", () => {
      it("✓ debe actualizar un horario existente y devolver el registro actualizado", async () => {
        const updated = { id: 7, product_id: 3, day_of_week: 4, start_time: "09:00", end_time: "13:00" };
        mockQuery.mockResolvedValueOnce({ rows: [updated] });

        const result = await DisponibilidadDAO.update(7, {
          day_of_week: 4,
          start_time: "09:00",
          end_time: "13:00",
        });

        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/UPDATE\s+product_availability\s+SET\s+day_of_week\s*=\s*\$2,\s*start_time\s*=\s*\$3,\s*end_time\s*=\s*\$4\s+WHERE\s+id\s*=\s*\$1/i);
        expect(params).toEqual([7, 4, "09:00", "13:00"]);
        expect(result).toEqual(updated);
      });

      it("✓ debe retornar null si el ID no existe", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        const result = await DisponibilidadDAO.update(999, { day_of_week: 1, start_time: "10:00", end_time: "11:00" });
        expect(result).toBeNull();
      });

      it("✗ debe propagar error de base de datos", async () => {
        const dbError = new Error("Constraint violation");
        mockQuery.mockRejectedValueOnce(dbError);
        await expect(DisponibilidadDAO.update(1, { day_of_week: 1, start_time: "09:00", end_time: "10:00" }))
          .rejects.toThrow("Constraint violation");
      });
    });

    describe("getById", () => {
      it("✓ debe obtener un horario por su ID", async () => {
        const schedule = { id: 5, product_id: 2, day_of_week: 3, start_time: "12:00", end_time: "15:00" };
        mockQuery.mockResolvedValueOnce({ rows: [schedule] });
        const result = await DisponibilidadDAO.getById(5);
        const [sql] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/SELECT\s+.+\s+FROM\s+product_availability\s+WHERE\s+id\s*=\s*\$1/i);
        expect(result).toEqual(schedule);
      });

      it("✓ debe retornar null si no existe", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        const result = await DisponibilidadDAO.getById(999);
        expect(result).toBeNull();
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Service + API Route)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    // Espías para interceptar los métodos del DAO sin mockear el módulo completo
    let spyGetById: jest.SpyInstance;
    let spyUpdate: jest.SpyInstance;
    let spyHasOverlap: jest.SpyInstance;

    beforeEach(() => {
      spyGetById = jest.spyOn(DisponibilidadDAO, 'getById');
      spyUpdate = jest.spyOn(DisponibilidadDAO, 'update');
      spyHasOverlap = jest.spyOn(DisponibilidadDAO, 'hasOverlap');
    });

    afterEach(() => {
      spyGetById.mockRestore();
      spyUpdate.mockRestore();
      spyHasOverlap.mockRestore();
    });

    describe("DisponibilidadService.update", () => {
      it("✓ debe actualizar horario cuando existe, tiempos válidos y sin solapamiento", async () => {
        const existing = { id: 10, product_id: 1, day_of_week: 1, start_time: "08:00", end_time: "12:00" };
        spyGetById.mockResolvedValueOnce(existing);
        spyHasOverlap.mockResolvedValueOnce(false);
        const updated = { ...existing, day_of_week: 2, start_time: "09:00", end_time: "13:00" };
        spyUpdate.mockResolvedValueOnce(updated);

        const controller = new DisponibilidadService();
        const result = await controller.update(10, { dayOfWeek: 2, startTime: "09:00", endTime: "13:00" });

        expect(spyGetById).toHaveBeenCalledWith(10);
        expect(spyHasOverlap).toHaveBeenCalledWith(1, 2, "09:00", "13:00", 10);
        expect(spyUpdate).toHaveBeenCalledWith(10, { day_of_week: 2, start_time: "09:00", end_time: "13:00" });
        expect(result).toEqual(updated);
      });

      it("✗ debe lanzar error si startTime >= endTime", async () => {
        const controller = new DisponibilidadService();
        await expect(controller.update(1, { dayOfWeek: 1, startTime: "14:00", endTime: "12:00" }))
          .rejects.toThrow("startTime must be less than endTime");
        expect(spyGetById).not.toHaveBeenCalled();
      });

      it("✗ debe lanzar 'Not found' si el horario no existe", async () => {
        spyGetById.mockResolvedValueOnce(null);
        const controller = new DisponibilidadService();
        await expect(controller.update(99, { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" }))
          .rejects.toThrow("Not found");
        expect(spyUpdate).not.toHaveBeenCalled();
      });

      it("✗ debe lanzar error si hay solapamiento (excluyendo el mismo ID)", async () => {
        spyGetById.mockResolvedValueOnce({ id: 5, product_id: 2 });
        spyHasOverlap.mockResolvedValueOnce(true);
        const controller = new DisponibilidadService();
        await expect(controller.update(5, { dayOfWeek: 1, startTime: "10:00", endTime: "12:00" }))
          .rejects.toThrow("Schedule overlaps with existing one");
        expect(spyUpdate).not.toHaveBeenCalled();
      });
    });

    describe("API PATCH /api/platos/[id]/availability/[availabilityId]", () => {
      it("✓ debe retornar 200 y el horario actualizado", async () => {
        spyGetById.mockResolvedValueOnce({ id: 7, product_id: 3 });
        spyHasOverlap.mockResolvedValueOnce(false);
        const updatedSchedule = { id: 7, product_id: 3, day_of_week: 5, start_time: "20:00", end_time: "23:00" };
        spyUpdate.mockResolvedValueOnce(updatedSchedule);

        const req = createPatchRequest({ dayOfWeek: 5, startTime: "20:00", endTime: "23:00" });
        const params = Promise.resolve({ availabilityId: "7" });
        const res = await PATCH(req, { params });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ availability: updatedSchedule });
      });

      it("✗ debe retornar 400 si availabilityId no es número", async () => {
        const req = createPatchRequest({ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" });
        const params = Promise.resolve({ availabilityId: "abc" });
        const res = await PATCH(req, { params });
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "Invalid id" });
      });

      it("✗ debe retornar 404 si el horario no existe", async () => {
        spyGetById.mockResolvedValueOnce(null);
        const req = createPatchRequest({ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" });
        const params = Promise.resolve({ availabilityId: "999" });
        const res = await PATCH(req, { params });
        expect(res.status).toBe(404);
        expect(await res.json()).toEqual({ error: "Not found" });
      });

      it("✗ debe retornar 400 por solapamiento", async () => {
        spyGetById.mockResolvedValueOnce({ id: 8, product_id: 2 });
        spyHasOverlap.mockResolvedValueOnce(true);
        const req = createPatchRequest({ dayOfWeek: 2, startTime: "12:00", endTime: "14:00" });
        const params = Promise.resolve({ availabilityId: "8" });
        const res = await PATCH(req, { params });
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "Schedule overlaps with existing one" });
      });
    });
  });
});