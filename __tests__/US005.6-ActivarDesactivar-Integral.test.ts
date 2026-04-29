import { ProductoDAO } from "@/models/daos/ProductoDAO";
import { MenuController } from "@/controllers/MenuController";
import { db } from "@/config/db";
import { PATCH as activateRoute } from "@/app/api/platos/[id]/activate/route";
import { PATCH as deactivateRoute } from "@/app/api/platos/[id]/desactivate/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({ 
  db: { query: jest.fn() } 
}));

const mockQuery = db.query as jest.Mock;

describe("US005.6: Gestión de Menú – Activar/Desactivar plato (Integral)", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ProductoDAO)
  // =========================================================
  describe("Capa de Persistencia (ProductoDAO)", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("updateActiveStatus", () => {
      it("✓ debe activar el producto (is_active = true)", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });
        const result = await ProductoDAO.updateActiveStatus(5, true);
        expect(result).toBe(true);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining("UPDATE products SET is_active = $1"),
          [true, 5]
        );
      });

      it("✓ debe desactivar el producto (is_active = false)", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });
        const result = await ProductoDAO.updateActiveStatus(5, false);
        expect(result).toBe(true);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining("UPDATE products SET is_active = $1"),
          [false, 5]
        );
      });

      it("✓ debe retornar false si no se actualizó ninguna fila", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
        const result = await ProductoDAO.updateActiveStatus(99, true);
        expect(result).toBe(false);
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Controller & API)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    let controller: MenuController;
    let spyFindById: jest.SpyInstance;
    let spyUpdateActiveStatus: jest.SpyInstance;

    beforeEach(() => {
      controller = new MenuController();
      // Espiamos ProductoDAO para aislar la lógica de servicios en esta sección
      spyFindById = jest.spyOn(ProductoDAO, 'findByIdIncludingInactive');
      spyUpdateActiveStatus = jest.spyOn(ProductoDAO, 'updateActiveStatus');
    });

    afterEach(() => {
      spyFindById.mockRestore();
      spyUpdateActiveStatus.mockRestore();
    });

    describe("MenuController.activateProduct / deactivateProduct", () => {
      it("✓ debe activar el producto si existe", async () => {
        spyFindById.mockResolvedValueOnce({ id: 1 });
        spyUpdateActiveStatus.mockResolvedValueOnce(true);
        
        await controller.activateProduct(1);
        
        expect(spyUpdateActiveStatus).toHaveBeenCalledWith(1, true);
      });

      it("✓ debe desactivar el producto si existe", async () => {
        spyFindById.mockResolvedValueOnce({ id: 2 });
        spyUpdateActiveStatus.mockResolvedValueOnce(true);
        
        await controller.deactivateProduct(2);
        
        expect(spyUpdateActiveStatus).toHaveBeenCalledWith(2, false);
      });

      it("✗ debe lanzar error si producto no existe al activar", async () => {
        spyFindById.mockResolvedValueOnce(null);
        
        await expect(controller.activateProduct(99)).rejects.toThrow("Producto no encontrado");
        expect(spyUpdateActiveStatus).not.toHaveBeenCalled();
      });

      it("✗ debe lanzar error si updateActiveStatus falla (retorna false)", async () => {
        spyFindById.mockResolvedValueOnce({ id: 1 });
        spyUpdateActiveStatus.mockResolvedValueOnce(false);
        
        await expect(controller.deactivateProduct(1)).rejects.toThrow("No se pudo desactivar el producto");
      });
    });

    describe("API activate route", () => {
      it("✓ debe retornar 200 al activar", async () => {
        spyFindById.mockResolvedValueOnce({ id: 5 });
        spyUpdateActiveStatus.mockResolvedValueOnce(true);
        
        const req = {} as NextRequest;
        const params = Promise.resolve({ id: "5" });
        const res = await activateRoute(req, { params });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ message: "Producto activado exitosamente" });
      });

      it("✗ debe retornar 500 si hay error", async () => {
        spyFindById.mockRejectedValueOnce(new Error("DB error"));
        
        const req = {} as NextRequest;
        const params = Promise.resolve({ id: "1" });
        const res = await activateRoute(req, { params });
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json).toEqual({ error: "DB error" });
      });
    });

    describe("API desactivate route", () => {
      it("✓ debe retornar 200 al desactivar", async () => {
        spyFindById.mockResolvedValueOnce({ id: 3 });
        spyUpdateActiveStatus.mockResolvedValueOnce(true);
        
        const req = {} as NextRequest;
        const params = Promise.resolve({ id: "3" });
        const res = await deactivateRoute(req, { params });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ message: "Producto desactivado" });
      });
    });
  });
});