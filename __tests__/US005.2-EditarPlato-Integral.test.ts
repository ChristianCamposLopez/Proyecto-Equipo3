import { ProductoDAO } from "@/models/daos/ProductoDAO";
import { MenuService } from "@/services/MenuService";
import { db } from "@/config/db";
import { PATCH as patchNombre } from "@/app/api/platos/[id]/nombre/route";
import { PATCH as patchDescripcion } from "@/app/api/platos/[id]/descripcion/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

describe("US005.2: Gestión de Menú – Editar plato (Pruebas Integrales)", () => {
  beforeAll(() => {
    console.log(">>> Probando US005: Edición de platos en el menú...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ProductoDAO)
  // =========================================================
  describe("Capa de Persistencia (ProductoDAO)", () => {

    describe("updateProductoEntity – Lógica SQL Dinámica", () => {
      it("✓ debe modificar el nombre del plato", async () => {
        const mockRow = { id: 5, name: "Pizza Pepperoni XL", descripcion: "Tradicional" };
        mockQuery.mockResolvedValueOnce({ rows: [mockRow] });

        const result = await ProductoDAO.updateProductoEntity(5, { name: "Pizza Pepperoni XL" });

        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/UPDATE\s+products\s+SET\s+name\s+=\s+\$1\s+WHERE\s+id\s+=\s+\$2/i);
        expect(params).toEqual(["Pizza Pepperoni XL", 5]);
        expect(result.name).toBe("Pizza Pepperoni XL");
      });

      it("✓ debe modificar la descripción del plato", async () => {
        const mockRow = { id: 5, name: "Pizza", descripcion: "Nueva receta con orilla de queso" };
        mockQuery.mockResolvedValueOnce({ rows: [mockRow] });

        const result = await ProductoDAO.updateProductoEntity(5, { descripcion: "Nueva receta con orilla de queso" });

        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/UPDATE\s+products\s+SET\s+descripcion\s+=\s+\$1\s+WHERE\s+id\s+=\s+\$2/i);
        expect(sql).not.toContain("name =");
        expect(params).toEqual(["Nueva receta con orilla de queso", 5]);
        expect(result.descripcion).toBe("Nueva receta con orilla de queso");
      });

      it("✓ debe modificar nombre y descripción simultáneamente", async () => {
        const mockRow = { id: 5, name: "Hamburguesa Doble", descripcion: "Con tocino y cheddar" };
        mockQuery.mockResolvedValueOnce({ rows: [mockRow] });

        await ProductoDAO.updateProductoEntity(5, { 
          name: "Hamburguesa Doble", 
          descripcion: "Con tocino y cheddar" 
        });

        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/SET\s+name\s+=\s+\$1,\s+descripcion\s+=\s+\$2\s+WHERE\s+id\s+=\s+\$3/i);
        expect(params).toEqual(["Hamburguesa Doble", "Con tocino y cheddar", 5]);
      });
    });

    describe("Validación de errores y duplicados", () => {
      it("✕ debe lanzar error si se intenta actualizar sin datos", async () => {
        await expect(ProductoDAO.updateProductoEntity(5, {})).rejects.toThrow(
          "No hay datos para actualizar"
        );
      });

      it("✓ debe buscar el nombre para validar que no existan duplicados", async () => {
        const existing = { id: 10, name: "Tacos al Pastor" };
        mockQuery.mockResolvedValueOnce({ rows: [existing] });

        const result = await ProductoDAO.findByName("tacos al pastor");

        expect(result).toEqual(existing);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringMatching(/LOWER\(name\)\s+=\s+LOWER\(\$1\)/i),
          ["tacos al pastor"]
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
    let spyFindByName: jest.SpyInstance;
    let spyUpdateProductoEntity: jest.SpyInstance;

    beforeEach(() => {
      controller = new MenuService();
      spyFindById = jest.spyOn(ProductoDAO, 'findByIdIncludingInactive');
      spyFindByName = jest.spyOn(ProductoDAO, 'findByName');
      spyUpdateProductoEntity = jest.spyOn(ProductoDAO, 'updateProductoEntity');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe("MenuService - Lógica de Negocio", () => {
      it("✓ updateNombre debe validar duplicado y actualizar", async () => {
        spyFindById.mockResolvedValueOnce({ id: 1, name: "Viejo" });
        spyFindByName.mockResolvedValueOnce(null);
        spyUpdateProductoEntity.mockResolvedValueOnce({ id: 1, name: "Nuevo" });

        const result = await controller.updateNombre(1, "Nuevo");
        
        expect(spyFindByName).toHaveBeenCalledWith("Nuevo");
        expect(spyUpdateProductoEntity).toHaveBeenCalledWith(1, { name: "Nuevo" });
        expect(result.name).toBe("Nuevo");
      });

      it("✗ updateNombre debe rechazar si el nombre ya existe en otro producto", async () => {
        spyFindById.mockResolvedValueOnce({ id: 1 });
        spyFindByName.mockResolvedValueOnce({ id: 2, name: "Duplicado", deleted_at: null });

        await expect(controller.updateNombre(1, "Duplicado"))
          .rejects.toThrow("Ya existe un plato con ese nombre");
        expect(spyUpdateProductoEntity).not.toHaveBeenCalled();
      });

      it("✓ updateDescripcion debe actualizar sin validaciones de duplicados", async () => {
        spyUpdateProductoEntity.mockResolvedValueOnce({ id: 1, descripcion: "Nueva desc" });
        
        const result = await controller.updateDescripcion(1, "Nueva desc");
        
        expect(spyUpdateProductoEntity).toHaveBeenCalledWith(1, { descripcion: "Nueva desc" });
        expect(result.descripcion).toBe("Nueva desc");
      });
    });

    describe("API Routes - Integración", () => {
      
      describe("PATCH /api/platos/[id]/nombre", () => {
        it("✓ debe retornar 200 y el producto actualizado", async () => {
          spyFindById.mockResolvedValueOnce({ id: 5 });
          spyFindByName.mockResolvedValueOnce(null);
          spyUpdateProductoEntity.mockResolvedValueOnce({ id: 5, name: "Nuevo nombre" });

          const req = { json: async () => ({ name: "Nuevo nombre" }) } as NextRequest;
          const params = Promise.resolve({ id: "5" });
          
          const res = await patchNombre(req, { params });
          const json = await res.json();

          expect(res.status).toBe(200);
          expect(json).toEqual({ 
            message: "Nombre actualizado", 
            product: { id: 5, name: "Nuevo nombre" } 
          });
        });

        it("✗ debe retornar 400 si falta el nombre en el body", async () => {
          const req = { json: async () => ({}) } as NextRequest;
          const params = Promise.resolve({ id: "5" });
          
          const res = await patchNombre(req, { params });
          
          expect(res.status).toBe(400);
          expect(await res.json()).toEqual({ error: "El nombre es requerido" });
        });

        it("✗ debe retornar 500 si hay error en el controlador", async () => {
          spyFindByName.mockRejectedValueOnce(new Error("DB error"));
          
          const req = { json: async () => ({ name: "Test" }) } as NextRequest;
          const params = Promise.resolve({ id: "5" });
          
          const res = await patchNombre(req, { params });
          
          expect(res.status).toBe(500);
          expect(await res.json()).toEqual({ error: "DB error" });
        });
      });

      describe("PATCH /api/platos/[id]/descripcion", () => {
        it("✓ debe actualizar descripción incluso si es null", async () => {
          spyUpdateProductoEntity.mockResolvedValueOnce({ id: 3, descripcion: null });
          
          const req = { json: async () => ({ descripcion: null }) } as NextRequest;
          const params = Promise.resolve({ id: "3" });
          
          const res = await patchDescripcion(req, { params });
          
          expect(res.status).toBe(200);
          expect(await res.json()).toMatchObject({ message: "Descripción actualizada" });
        });
      });
    });
  });
});