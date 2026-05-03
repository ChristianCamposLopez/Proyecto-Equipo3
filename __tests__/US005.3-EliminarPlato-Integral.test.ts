import { ProductoDAO } from "@/models/daos/ProductoDAO";
import { MenuService } from "@/services/MenuService";
import { db } from "@/config/db";
import { DELETE } from "@/app/api/platos/[id]/delete/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() }
}));

const mockQuery = db.query as jest.Mock;

describe("US005.3: Gestión de Menú – Eliminar plato (Pruebas Integrales)", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ProductoDAO)
  // =========================================================
  describe("Capa de Persistencia (ProductoDAO)", () => {

    describe("logicalDelete", () => {
      it("✓ debe actualizar deleted_at a NOW() y retornar true si se afectó alguna fila", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });
        
        const result = await ProductoDAO.logicalDelete(42);
        
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining("UPDATE products SET deleted_at = NOW()"),
          [42]
        );
        expect(result).toBe(true);
      });

      it("✓ debe retornar false si no existe el producto", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
        const result = await ProductoDAO.logicalDelete(999);
        expect(result).toBe(false);
      });

      it("✗ debe propagar error de base de datos", async () => {
        mockQuery.mockRejectedValueOnce(new Error("Timeout"));
        await expect(ProductoDAO.logicalDelete(1)).rejects.toThrow("Timeout");
      });
    });

    describe("findByIdIncludingInactive", () => {
      it("✓ debe encontrar producto incluso si está inactivo o eliminado", async () => {
        const softDeleted = { id: 1, deleted_at: new Date() };
        mockQuery.mockResolvedValueOnce({ rows: [softDeleted] });
        
        const result = await ProductoDAO.findByIdIncludingInactive(1);
        
        expect(result).toEqual(softDeleted);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringMatching(/SELECT.*FROM\s+products\s+WHERE\s+id\s+=\s+\$1/i),
          [1]
        );
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Service & API)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    
    let controller: MenuService;
    let spyFindById: jest.SpyInstance;
    let spyLogicalDelete: jest.SpyInstance;

    beforeEach(() => {
      controller = new MenuService();
      // Espiamos los métodos del DAO para controlar su comportamiento en esta capa
      spyFindById = jest.spyOn(ProductoDAO, 'findByIdIncludingInactive');
      spyLogicalDelete = jest.spyOn(ProductoDAO, 'logicalDelete');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe("MenuService.eliminarProductoEntity", () => {
      it("✓ debe eliminar lógicamente si el producto existe", async () => {
        spyFindById.mockResolvedValueOnce({ id: 5, name: "Test" });
        spyLogicalDelete.mockResolvedValueOnce(true);
        
        await expect(controller.eliminarProductoEntity(5)).resolves.toBeUndefined();
        
        expect(spyFindById).toHaveBeenCalledWith(5);
        expect(spyLogicalDelete).toHaveBeenCalledWith(5);
      });

      it("✗ debe lanzar error si el producto no existe", async () => {
        spyFindById.mockResolvedValueOnce(null);
        
        await expect(controller.eliminarProductoEntity(99)).rejects.toThrow("Producto no encontrado");
        expect(spyLogicalDelete).not.toHaveBeenCalled();
      });

      it("✗ debe lanzar error si logicalDelete devuelve false", async () => {
        spyFindById.mockResolvedValueOnce({ id: 1 });
        spyLogicalDelete.mockResolvedValueOnce(false);
        
        await expect(controller.eliminarProductoEntity(1)).rejects.toThrow("No se pudo eliminar el producto");
      });
    });

    describe("API DELETE /api/platos/[id]/delete", () => {
      it("✓ debe retornar 200 cuando se elimina correctamente", async () => {
        spyFindById.mockResolvedValueOnce({ id: 10 });
        spyLogicalDelete.mockResolvedValueOnce(true);
        
        const req = {} as NextRequest;
        const params = Promise.resolve({ id: "10" });
        const res = await DELETE(req, { params });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ message: "Producto eliminado lógicamente" });
      });

      it("✗ debe retornar 400 si el ID no es número válido", async () => {
        const req = {} as NextRequest;
        const params = Promise.resolve({ id: "abc" });
        
        const res = await DELETE(req, { params });
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json).toEqual({ error: "ID inválido" });
      });

      it("✗ debe retornar 500 si el controlador lanza error", async () => {
        spyFindById.mockRejectedValueOnce(new Error("DB error"));
        
        const req = {} as NextRequest;
        const params = Promise.resolve({ id: "1" });
        const res = await DELETE(req, { params });
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json).toEqual({ error: "DB error" });
      });
    });
  });
});