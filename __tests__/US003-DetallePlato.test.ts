/**
 * US003: Experiencia del Cliente – Detalle del plato
 * Pruebas sobre la obtención de información detallada de un producto.
 */

import { ProductoDAO } from "@/models/daos/ProductoDAO";
import { MenuService } from "@/services/MenuService";
import { db } from "@/config/db";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

describe("US003: Experiencia del Cliente – Detalle del plato", () => {
  
  beforeAll(() => {
    console.log(">>> Probando US003: Visualización de detalles del plato...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ProductoDAO.getProductById)
  // =========================================================
  describe("Capa de Persistencia (ProductoDAO.getProductById)", () => {
    
    it("✓ debe retornar el detalle completo si el producto existe (Camino Feliz)", async () => {
      console.log("  -> Verificando obtención de detalle por ID...");
      const fakeProduct = { id: 101, name: "Tacos al Pastor", base_price: 25.50 };
      mockQuery.mockResolvedValueOnce({ rows: [fakeProduct], rowCount: 1 });

      const result = await ProductoDAO.getProductById(101);
      expect(result).toEqual(fakeProduct);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringMatching(/WHERE id = \$1/i), [101]);
    });

    it("⚠ debe retornar null si el producto no existe (Camino Alternativo)", async () => {
      console.log("  -> Verificando producto inexistente...");
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await ProductoDAO.getProductById(999);
      expect(result).toBeNull();
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS (MenuService.getProductById)
  // =========================================================
  describe("Capa de Servicios (MenuService.getProductById)", () => {
    
    it("✓ debe retornar el producto si existe", async () => {
      const fakeProduct = { id: 1, name: "Platillo" };
      jest.spyOn(ProductoDAO, 'getProductById').mockResolvedValue(fakeProduct as any);

      const service = new MenuService();
      const result = await service.getProductById(1);
      
      expect(result).toEqual(fakeProduct);
    });

    it("⚠ debe lanzar error si el producto no existe", async () => {
      console.log("  -> Verificando error de negocio para ID inexistente...");
      jest.spyOn(ProductoDAO, 'getProductById').mockResolvedValue(null);

      const service = new MenuService();
      await expect(service.getProductById(999)).rejects.toThrow("Producto no encontrado");
    });
  });
});
