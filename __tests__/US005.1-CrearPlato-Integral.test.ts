import { ProductoDAO } from "@/models/daos/ProductoDAO";
import { MenuService } from "@/services/MenuService";
import { db } from "@/config/db";
import { POST } from "@/app/api/platos/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

const createPostRequest = (body: any) => {
  return {
    json: async () => body,
  } as NextRequest;
};

describe("US005.1: Gestión de Menú – Crear plato (Pruebas Integrales)", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ProductoDAO)
  // =========================================================
  describe("Capa de Persistencia (ProductoDAO)", () => {
    
    describe("createProductoEntity", () => {
      it("✓ debe insertar un nuevo producto con los datos correctos y devolverlo", async () => {
        const newProductoEntity = {
          id: 10,
          name: "Hamburguesa",
          base_price: 12.5,
          stock: 50,
          category_id: 3,
          descripcion: "Con queso y bacon",
          is_active: true,
          is_available: true,
          deleted_at: null,
        };
        mockQuery.mockResolvedValueOnce({ rows: [newProductoEntity] });

        const result = await ProductoDAO.createProductoEntity({
          name: "Hamburguesa",
          base_price: 12.5,
          stock: 50,
          category_id: 3,
          descripcion: "Con queso y bacon",
        });

        expect(mockQuery).toHaveBeenCalledTimes(1);
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toContain("INSERT INTO products");
        expect(params).toEqual(["Hamburguesa", 12.5, 50, 3, "Con queso y bacon"]);
        expect(result).toEqual(newProductoEntity);
      });

      it("✓ debe aceptar descripción nula cuando no se proporciona", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        await ProductoDAO.createProductoEntity({
          name: "Papas",
          base_price: 5,
          stock: 100,
          category_id: 2,
        });
        const params = mockQuery.mock.calls[0][1];
        expect(params[4]).toBeNull();
      });

      it("✗ debe propagar el error si la base de datos falla", async () => {
        const dbError = new Error("Constraint violation");
        mockQuery.mockRejectedValueOnce(dbError);
        await expect(ProductoDAO.createProductoEntity({
          name: "Duplicado",
          base_price: 10,
          stock: 5,
          category_id: 1,
        })).rejects.toThrow("Constraint violation");
      });
    });

    describe("findByName (usado para validar duplicados)", () => {
      it("✓ debe buscar por nombre (case-insensitive)", async () => {
        const existing = { id: 5, name: "Pizza", deleted_at: null };
        mockQuery.mockResolvedValueOnce({ rows: [existing] });
        const result = await ProductoDAO.findByName("pizza");
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining("LOWER(name) = LOWER($1)"),
          ["pizza"]
        );
        expect(result).toEqual(existing);
      });

      it("✓ debe devolver null si no existe el nombre", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        const result = await ProductoDAO.findByName("Nonexistent");
        expect(result).toBeNull();
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Service + API Route)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    
    // Espías para interceptar el DAO sin mockear el módulo completo
    let spyFindByName: jest.SpyInstance;
    let spyCreateProductoEntity: jest.SpyInstance;

    beforeEach(() => {
      spyFindByName = jest.spyOn(ProductoDAO, 'findByName');
      spyCreateProductoEntity = jest.spyOn(ProductoDAO, 'createProductoEntity');
    });

    afterEach(() => {
      spyFindByName.mockRestore();
      spyCreateProductoEntity.mockRestore();
    });

    describe("MenuService.createProductoEntity", () => {
      it("✓ debe crear un producto cuando los datos son válidos y no hay duplicado activo", async () => {
        spyFindByName.mockResolvedValueOnce(null); 
        const created = { id: 99, name: "Taco", base_price: 8 };
        spyCreateProductoEntity.mockResolvedValueOnce(created);

        const controller = new MenuService();
        const result = await controller.createProductoEntity({
          name: "Taco",
          base_price: 8,
          stock: 20,
          category_id: 4,
          descripcion: "Tacos al pastor",
        });

        expect(spyFindByName).toHaveBeenCalledWith("Taco");
        expect(spyCreateProductoEntity).toHaveBeenCalled();
        expect(result).toEqual(created);
      });

      it("✗ debe lanzar error si el precio es <= 0", async () => {
        const controller = new MenuService();
        await expect(controller.createProductoEntity({
          name: "Test",
          base_price: 0,
          stock: 10,
          category_id: 1,
        })).rejects.toThrow("El precio debe ser mayor a 0");
        expect(spyCreateProductoEntity).not.toHaveBeenCalled();
      });

      it("✗ debe lanzar error si el stock es negativo", async () => {
        const controller = new MenuService();
        await expect(controller.createProductoEntity({
          name: "Test",
          base_price: 5,
          stock: -1,
          category_id: 1,
        })).rejects.toThrow("El stock no puede ser negativo");
        expect(spyCreateProductoEntity).not.toHaveBeenCalled();
      });

      it("✗ debe lanzar error si ya existe un plato activo con el mismo nombre", async () => {
        spyFindByName.mockResolvedValueOnce({ id: 1, name: "Pizza", deleted_at: null });
        const controller = new MenuService();
        await expect(controller.createProductoEntity({
          name: "Pizza",
          base_price: 10,
          stock: 5,
          category_id: 2,
        })).rejects.toThrow("Ya existe un plato activo o no eliminado con ese nombre");
        expect(spyCreateProductoEntity).not.toHaveBeenCalled();
      });
    });

    describe("API Route POST /api/platos", () => {
      it("✓ debe retornar 200 y el producto creado cuando todo es correcto", async () => {
        spyFindByName.mockResolvedValueOnce(null);
        const fakeProductoEntity = { id: 1, name: "Empanada", base_price: 3 };
        spyCreateProductoEntity.mockResolvedValueOnce(fakeProductoEntity);

        const req = createPostRequest({
          name: "Empanada",
          base_price: 3,
          stock: 100,
          category_id: 5,
          descripcion: "Carne",
        });
        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ message: "Plato creado exitosamente", product: fakeProductoEntity });
      });

      it("✗ debe retornar 400 si faltan campos obligatorios (name, base_price, stock, category_id)", async () => {
        const req = createPostRequest({ name: "Solo nombre" });
        const res = await POST(req);
        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json).toEqual({ error: "Faltan campos obligatorios" });
        expect(spyCreateProductoEntity).not.toHaveBeenCalled();
      });

      it("✗ debe retornar 500 si el controlador lanza un error", async () => {
        spyFindByName.mockRejectedValueOnce(new Error("DB error"));
        const req = createPostRequest({ name: "X", base_price: 1, stock: 1, category_id: 1 });
        const res = await POST(req);
        const json = await res.json();
        expect(res.status).toBe(500);
        expect(json).toEqual({ error: "DB error" });
      });
    });
  });
});