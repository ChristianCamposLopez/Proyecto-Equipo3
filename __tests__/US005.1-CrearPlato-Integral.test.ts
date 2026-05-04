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
  } as unknown as NextRequest;
};

describe("US005.1: Gestión de Menú – Crear plato (Robustez y Sembrado)", () => {
  
  beforeAll(() => {
    console.log(">>> Probando US005: Creación de platos (Caminos Alternativos)...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ProductoDAO)
  // =========================================================
  describe("Capa de Persistencia (ProductoDAO)", () => {
    
    it("✓ debe insertar un nuevo producto con datos mínimos (Camino Feliz)", async () => {
      console.log("  -> Verificando inserción exitosa...");
      const fakeProduct = { id: 10, name: "Taco", base_price: 2.5, stock: 100, category_id: 1, is_active: true };
      mockQuery.mockResolvedValueOnce({ rows: [fakeProduct] });

      const result = await ProductoDAO.createProductoEntity({
        name: "Taco",
        base_price: 2.5,
        stock: 100,
        category_id: 1
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO products/i),
        expect.arrayContaining(["Taco", 2.5, 100, 1])
      );
      expect(result).toEqual(fakeProduct);
    });

    it("✗ debe lanzar error ante violación de constraint unique/null (Camino Alternativo)", async () => {
      console.log("  -> Verificando error de integridad de DB...");
      mockQuery.mockRejectedValueOnce(new Error('duplicate key value violates unique constraint "products_name_key"'));
      
      await expect(ProductoDAO.createProductoEntity({
        name: "Duplicado",
        base_price: 10,
        stock: 1,
        category_id: 1
      })).rejects.toThrow("duplicate key");
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS (MenuService)
  // =========================================================
  describe("Capa de Servicios (MenuService)", () => {
    it("⚠ debe rechazar creación si el plato ya existe activo (Lógica de Negocio)", async () => {
      console.log("  -> Verificando validación de duplicados en Service...");
      const existingProduct = { id: 1, name: "Pizza", deleted_at: null };
      jest.spyOn(ProductoDAO, 'findByName').mockResolvedValue(existingProduct);
      
      const service = new MenuService();
      await expect(service.createProductoEntity({
        name: "Pizza",
        base_price: 10,
        stock: 5,
        category_id: 1
      })).rejects.toThrow("Ya existe un plato activo");
    });

    it("⚠ debe validar que el precio sea positivo", async () => {
      console.log("  -> Verificando validación de precio positivo...");
      const service = new MenuService();
      await expect(service.createProductoEntity({
        name: "Gratis",
        base_price: -1,
        stock: 5,
        category_id: 1
      })).rejects.toThrow("El precio debe ser mayor a 0");
    });

    it("⚠ debe validar que el stock no sea negativo", async () => {
      console.log("  -> Verificando validación de stock no negativo...");
      const service = new MenuService();
      await expect(service.createProductoEntity({
        name: "Papas",
        base_price: 5,
        stock: -10,
        category_id: 1
      })).rejects.toThrow("El stock no puede ser negativo");
    });
  });

  // =========================================================
  // 3. CAPA API (Controllers)
  // =========================================================
  describe("API Route POST /api/platos", () => {
    it("✗ debe retornar 400 si faltan campos requeridos", async () => {
      console.log("  -> Verificando rechazo de payload incompleto...");
      const req = createPostRequest({ name: "Incompleto" });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Faltan campos obligatorios");
    });

    it("✓ debe retornar 200 si la creación es exitosa", async () => {
      jest.spyOn(ProductoDAO, 'findByName').mockResolvedValue(null);
      jest.spyOn(ProductoDAO, 'createProductoEntity').mockResolvedValue({ id: 99 } as any);
      
      const req = createPostRequest({
        name: "Nuevo",
        base_price: 10,
        stock: 10,
        category_id: 1
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });
});