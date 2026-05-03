import { ProductoDAO } from "@/models/daos/ProductoDAO";
import { MenuController } from "@/controllers/MenuController";
import { db } from "@/config/db";
import { PATCH } from "@/app/api/platos/[id]/stock/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({ 
  db: { query: jest.fn() } 
}));

const mockQuery = db.query as jest.Mock;

describe("US005.5: Gestión de Menú – Actualizar stock (Integral)", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ProductoDAO)
  // =========================================================
  describe("Capa de Persistencia (ProductoDAO)", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("updateStock", () => {
      it("✓ debe actualizar la columna stock correctamente", async () => {
        // Simulamos que la base de datos afectó a 1 fila
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });
        
        const productoId = 8;
        const nuevoStock = 150;
        const esperadoIsAvailable = true; // 150 > 0 es true

        await ProductoDAO.updateStock(productoId, nuevoStock);
        
        // 1. Corregimos el Regex para que acepte la columna is_available y el tercer parámetro $3
        // 2. Corregimos el array de parámetros para que incluya [quantity, isAvailable, id]
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringMatching(/UPDATE\s+products\s+SET\s+stock\s*=\s*\$1,\s+is_available\s*=\s*\$2\s+WHERE\s+id\s*=\s*\$3/i),
          [nuevoStock, esperadoIsAvailable, productoId]
        );
      });

      // Añade este caso extra para probar el cambio de is_available a false
      it("✓ debe marcar is_available como false si el stock es 0", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });
        
        const productoId = 10;
        const nuevoStock = 0;

        await ProductoDAO.updateStock(productoId, nuevoStock);
        
        expect(mockQuery).toHaveBeenCalledWith(
          expect.any(String),
          [0, false, 10]
        );
      });

      it("✗ debe propagar error si la base de datos falla", async () => {
        mockQuery.mockRejectedValueOnce(new Error("DB Error"));
        await expect(ProductoDAO.updateStock(1, 10)).rejects.toThrow("DB Error");
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS Y API (MenuController + Routes)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    let controller: MenuController;
    let spyFindById: jest.SpyInstance;
    let spyUpdateStock: jest.SpyInstance;

    beforeEach(() => {
      controller = new MenuController();
      // Espiamos ProductoDAO para aislar la lógica de servicios
      spyFindById = jest.spyOn(ProductoDAO, 'findByIdIncludingInactive');
      spyUpdateStock = jest.spyOn(ProductoDAO, 'updateStock');
    });

    afterEach(() => {
      spyFindById.mockRestore();
      spyUpdateStock.mockRestore();
    });

    describe("MenuController.updateStock", () => {
      it("✓ debe actualizar stock si cantidad >= 0 y producto existe", async () => {
        spyFindById.mockResolvedValueOnce({ id: 3 });
        spyUpdateStock.mockResolvedValueOnce(true);

        await controller.updateStock(3, 200);
        
        expect(spyFindById).toHaveBeenCalledWith(3);
        expect(spyUpdateStock).toHaveBeenCalledWith(3, 200);
      });

      it("✗ debe rechazar stock negativo", async () => {
        await expect(controller.updateStock(1, -5))
          .rejects.toThrow("El stock no puede ser negativo");
        
        expect(spyUpdateStock).not.toHaveBeenCalled();
      });

      it("✗ debe rechazar si producto no existe", async () => {
        spyFindById.mockResolvedValueOnce(null);
        
        await expect(controller.updateStock(999, 10))
          .rejects.toThrow("Producto no encontrado");
        
        expect(spyUpdateStock).not.toHaveBeenCalled();
      });
    });

    describe("API PATCH /api/platos/[id]/stock", () => {
      it("✓ debe retornar 200 al actualizar stock", async () => {
        spyFindById.mockResolvedValueOnce({ id: 4 });
        spyUpdateStock.mockResolvedValueOnce(true);

        const req = { json: async () => ({ stock: 50 }) } as NextRequest;
        const params = Promise.resolve({ id: "4" });
        
        const res = await PATCH(req, { params });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ message: "Stock actualizado correctamente" });
      });

      it("✗ debe retornar 400 si stock es negativo", async () => {
        const req = { json: async () => ({ stock: -1 }) } as NextRequest;
        const params = Promise.resolve({ id: "1" });
        
        const res = await PATCH(req, { params });
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json).toEqual({ error: "El stock no puede ser negativo" });
      });

      it("✗ debe retornar 404 si el producto no existe", async () => {
        spyFindById.mockResolvedValueOnce(null);
        
        const req = { json: async () => ({ stock: 10 }) } as NextRequest;
        const params = Promise.resolve({ id: "99" });
        
        const res = await PATCH(req, { params });
        const json = await res.json();

        expect(res.status).toBe(404);
        expect(json).toEqual({ error: "Producto no encontrado" });
      });

     it("✗ debe retornar 500 ante un error inesperado", async () => {
        // El espía lanza un error técnico
        spyFindById.mockRejectedValueOnce(new Error("Fatal Error"));
        
        const req = { json: async () => ({ stock: 10 }) } as NextRequest;
        const params = Promise.resolve({ id: "1" });
        
        const res = await PATCH(req, { params });
        const json = await res.json();

        expect(res.status).toBe(500);
        // CAMBIO AQUÍ: El test debe esperar lo que el route.ts devuelve por contrato
        expect(json).toEqual({ error: "Error interno" }); 
      });
    });
  });
});