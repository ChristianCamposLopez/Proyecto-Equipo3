import { ProductoDAO } from "@/models/daos/ProductoDAO";
import { MenuController } from "@/controllers/MenuController";
import { db } from "@/config/db";
import { PATCH } from "@/app/api/platos/[id]/price/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({ 
  db: { query: jest.fn() } 
}));

const mockQuery = db.query as jest.Mock;

describe("US005.4: Gestión de Menú – Actualizar precio (Integral)", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ProductoDAO)
  // =========================================================
  describe("Capa de Persistencia (ProductoDAO)", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("updatePrice", () => {
      it("✓ debe ejecutar UPDATE con el nuevo precio", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });
        await ProductoDAO.updatePrice(7, 15.99);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining("UPDATE products SET base_price = $1"),
          [15.99, 7]
        );
      });

      it("✗ debe propagar error si la consulta falla", async () => {
        mockQuery.mockRejectedValueOnce(new Error("Constraint"));
        await expect(ProductoDAO.updatePrice(1, 10)).rejects.toThrow("Constraint");
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS Y API (MenuController + Routes)
  // =========================================================
  describe("Capa de Servicios y API", () => {
    // Espías para interceptar el DAO sin romper la implementación de arriba
    let spyFindById: jest.SpyInstance;
    let spyUpdatePrice: jest.SpyInstance;

    beforeEach(() => {
      spyFindById = jest.spyOn(ProductoDAO, 'findByIdIncludingInactive');
      spyUpdatePrice = jest.spyOn(ProductoDAO, 'updatePrice');
    });

    afterEach(() => {
      spyFindById.mockRestore();
      spyUpdatePrice.mockRestore();
    });

    describe("MenuController.updatePrice", () => {
      it("✓ debe actualizar si el precio > 0 y producto existe", async () => {
        spyFindById.mockResolvedValueOnce({ id: 1 });
        spyUpdatePrice.mockResolvedValueOnce(true);
        
        const controller = new MenuController();
        await controller.updatePrice(1, 25);
        expect(spyUpdatePrice).toHaveBeenCalledWith(1, 25);
      });

      it("✗ debe lanzar error si precio <= 0", async () => {
        const controller = new MenuController();
        await expect(controller.updatePrice(1, 0)).rejects.toThrow("El precio debe ser mayor a 0");
        expect(spyFindById).not.toHaveBeenCalled();
      });

      it("✗ debe lanzar error si producto no existe", async () => {
        spyFindById.mockResolvedValueOnce(null);
        const controller = new MenuController();
        await expect(controller.updatePrice(99, 10)).rejects.toThrow("Producto no encontrado");
        expect(spyUpdatePrice).not.toHaveBeenCalled();
      });
    });

    describe("API PATCH /api/platos/[id]/price", () => {
      it("✓ debe retornar 200 al actualizar precio", async () => {
        spyFindById.mockResolvedValueOnce({ id: 2 });
        spyUpdatePrice.mockResolvedValueOnce(true);
        
        const req = { json: async () => ({ price: 12.5 }) } as NextRequest;
        const params = Promise.resolve({ id: "2" });
        const res = await PATCH(req, { params });
        
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ message: "Precio actualizado correctamente" });
      });

      it("✗ debe retornar 400 si el precio es inválido (<=0)", async () => {
        const req = { json: async () => ({ price: -5 }) } as NextRequest;
        const params = Promise.resolve({ id: "1" });
        const res = await PATCH(req, { params });
        
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "El precio debe ser mayor a 0" });
      });

      it("✗ debe retornar 404 si producto no encontrado", async () => {
        spyFindById.mockResolvedValueOnce(null);
        const req = { json: async () => ({ price: 10 }) } as NextRequest;
        const params = Promise.resolve({ id: "999" });
        const res = await PATCH(req, { params });
        
        expect(res.status).toBe(404);
        expect(await res.json()).toEqual({ error: "Producto no encontrado" });
      });
    });
  });
});