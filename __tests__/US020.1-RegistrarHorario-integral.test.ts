import { DisponibilidadDAO } from "@/models/daos/DisponibilidadDAO";
import { db } from "@/config/db";
import { DisponibilidadService } from "@/services/DisponibilidadService";
import { POST } from "@/app/api/platos/[id]/availability/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES (solo la base de datos)
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

// Helper para simular NextRequest con body JSON
const createPostRequest = (body: any) => {
  return {
    json: async () => body,
  } as NextRequest;
};

describe("US020.1: Gestión de Menú – Registrar horario (Pruebas Integrales)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (DisponibilidadDAO)
  // =========================================================
  describe("Capa de Persistencia (DisponibilidadDAO)", () => {
    describe("create", () => {
      it("✓ debe insertar un nuevo horario y devolver el registro creado", async () => {
        const newSchedule = {
          id: 10,
          product_id: 5,
          day_of_week: 1,
          start_time: "10:00",
          end_time: "14:00",
        };
        mockQuery.mockResolvedValueOnce({ rows: [newSchedule] });

        const result = await DisponibilidadDAO.create({
          product_id: 5,
          day_of_week: 1,
          start_time: "10:00",
          end_time: "14:00",
        });

        expect(mockQuery).toHaveBeenCalledTimes(1);
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/INSERT\s+INTO\s+product_availability/i);
        expect(sql).toMatch(/VALUES\s*\(\s*\$1\s*,\s*\$2\s*,\s*\$3\s*,\s*\$4\s*\)/i);
        expect(params).toEqual([5, 1, "10:00", "14:00"]);
        expect(result).toEqual(newSchedule);
      });

      it("✗ debe propagar error de base de datos", async () => {
        const dbError = new Error("Foreign key violation");
        mockQuery.mockRejectedValueOnce(dbError);
        await expect(DisponibilidadDAO.create({
          product_id: 999,
          day_of_week: 1,
          start_time: "09:00",
          end_time: "10:00",
        })).rejects.toThrow("Foreign key violation");
      });
    });

    describe("hasOverlap", () => {
      it("✓ debe detectar solapamiento con otro horario existente (sin excluir)", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });
        const overlap = await DisponibilidadDAO.hasOverlap(5, 1, "10:00", "14:00");
        expect(overlap).toBe(true);
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/WHERE\s+product_id\s*=\s*\$1\s+AND\s+day_of_week\s*=\s*\$2/i);
        expect(sql).toMatch(/AND\s*\(\s*start_time\s*<\s*\$4\s+AND\s+end_time\s*>\s*\$3\s*\)/i);
        expect(params).toEqual([5, 1, "10:00", "14:00"]);
      });

      it("✓ debe retornar false cuando no hay solapamiento", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
        const overlap = await DisponibilidadDAO.hasOverlap(5, 1, "10:00", "14:00");
        expect(overlap).toBe(false);
      });

      it("✓ debe excluir un ID específico ", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
        await DisponibilidadDAO.hasOverlap(5, 1, "10:00", "14:00", 42);
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/AND\s+id\s*!=\s*\$5/i);
        expect(params).toEqual([5, 1, "10:00", "14:00", 42]);
      });

      it("✗ debe propagar error de base de datos", async () => {
        mockQuery.mockRejectedValueOnce(new Error("Connection lost"));
        await expect(DisponibilidadDAO.hasOverlap(1, 1, "09:00", "10:00"))
          .rejects.toThrow("Connection lost");
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Service + API Route)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    // Espías para interceptar los métodos del DAO sin mockear el módulo completo
    let spyCreate: jest.SpyInstance;
    let spyHasOverlap: jest.SpyInstance;

    beforeEach(() => {
      spyCreate = jest.spyOn(DisponibilidadDAO, 'create');
      spyHasOverlap = jest.spyOn(DisponibilidadDAO, 'hasOverlap');
    });

    afterEach(() => {
      spyCreate.mockRestore();
      spyHasOverlap.mockRestore();
    });

    describe("DisponibilidadService.create", () => {
      it("✓ debe crear un horario cuando no hay solapamiento y tiempos válidos", async () => {
        spyHasOverlap.mockResolvedValueOnce(false);
        const fakeSchedule = { id: 1, product_id: 10, day_of_week: 2, start_time: "08:00", end_time: "12:00" };
        spyCreate.mockResolvedValueOnce(fakeSchedule);

        const controller = new DisponibilidadService();
        const result = await controller.create({
          productId: 10,
          dayOfWeek: 2,
          startTime: "08:00",
          endTime: "12:00",
        });

        expect(spyHasOverlap).toHaveBeenCalledWith(10, 2, "08:00", "12:00");
        expect(spyCreate).toHaveBeenCalledWith({
          product_id: 10,
          day_of_week: 2,
          start_time: "08:00",
          end_time: "12:00",
        });
        expect(result).toEqual(fakeSchedule);
      });

      it("✗ debe lanzar error si startTime >= endTime", async () => {
        const controller = new DisponibilidadService();
        await expect(controller.create({
          productId: 1,
          dayOfWeek: 1,
          startTime: "14:00",
          endTime: "10:00",
        })).rejects.toThrow("startTime must be less than endTime");
        expect(spyHasOverlap).not.toHaveBeenCalled();
      });

      it("✗ debe lanzar error si dayOfWeek está fuera de rango (0-6)", async () => {
        const controller = new DisponibilidadService();
        await expect(controller.create({
          productId: 1,
          dayOfWeek: 7,
          startTime: "09:00",
          endTime: "10:00",
        })).rejects.toThrow("Invalid dayOfWeek");
      });

      it("✗ debe lanzar error si hay solapamiento con otro horario", async () => {
        spyHasOverlap.mockResolvedValueOnce(true);
        const controller = new DisponibilidadService();
        await expect(controller.create({
          productId: 1,
          dayOfWeek: 1,
          startTime: "10:00",
          endTime: "12:00",
        })).rejects.toThrow("Schedule overlaps with existing one");
        expect(spyCreate).not.toHaveBeenCalled();
      });
    });

    describe("API POST /api/platos/[id]/availability", () => {
      it("✓ debe retornar 200 y el horario creado", async () => {
        spyHasOverlap.mockResolvedValueOnce(false);
        const fakeSchedule = { id: 5, product_id: 2, day_of_week: 3, start_time: "15:00", end_time: "18:00" };
        spyCreate.mockResolvedValueOnce(fakeSchedule);

        const req = createPostRequest({ dayOfWeek: 3, startTime: "15:00", endTime: "18:00" });
        const params = Promise.resolve({ id: "2" });
        const res = await POST(req, { params });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ availability: fakeSchedule });
      });

      it("✗ debe retornar 400 si el ID del producto no es número", async () => {
        const req = createPostRequest({ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" });
        const params = Promise.resolve({ id: "abc" });
        const res = await POST(req, { params });
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "Invalid product id" });
      });

      it("✗ debe retornar 400 si falta algún campo en el body", async () => {
        const req = createPostRequest({ dayOfWeek: 1, startTime: "09:00" }); // falta endTime
        const params = Promise.resolve({ id: "1" });
        const res = await POST(req, { params });

        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toMatch(/Faltan campos|startTime must be less than endTime|overlaps/);
      });

      it("✗ debe retornar 500 si el controlador lanza error inesperado", async () => {
        spyHasOverlap.mockRejectedValueOnce(new Error("DB error"));
        const req = createPostRequest({ dayOfWeek: 1, startTime: "08:00", endTime: "09:00" });
        const params = Promise.resolve({ id: "1" });
        const res = await POST(req, { params });
        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: "DB error" });
      });
    });
  });
});