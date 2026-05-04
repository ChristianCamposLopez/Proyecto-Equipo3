/**
 * US001.2: Experiencia del Cliente – Buscador Global
 * Pruebas sobre la búsqueda de productos en el catálogo.
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

describe("US001.2: Experiencia del Cliente – Buscador Global", () => {
  
  beforeAll(() => {
    console.log(">>> [LOGICA] Verificando US001.2: Buscador Global de Catálogo...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ProductoDAO.searchProducts)
  // =========================================================
  describe("Capa de Persistencia (ProductoDAO.searchProducts)", () => {
    
    it("✓ debe encontrar productos por coincidencia parcial (Camino Feliz)", async () => {
      console.log("  -> Verificando búsqueda parcial de 'Pizza'...");
      const fakeResults = [
        { id: 1, name: "Pizza Pepperoni" },
        { id: 2, name: "Pizza Hawaiana" }
      ];
      mockQuery.mockResolvedValueOnce({ rows: fakeResults });

      const result = await ProductoDAO.searchProducts("Pizza", 1);
      expect(result).toHaveLength(2);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringMatching(/name\s+ILIKE\s+\$1/i),
        ["%Pizza%", 1]
      );
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS (MenuService.searchCatalog)
  // =========================================================
  describe("Capa de Servicios (MenuService.searchCatalog)", () => {
    it("⚠ debe rechazar búsquedas con términos vacíos o muy cortos", async () => {
      console.log("  -> Verificando validación de longitud de término...");
      const service = new MenuService();
      await expect(service.searchCatalog("", 1)).rejects.toThrow("Término de búsqueda inválido");
      await expect(service.searchCatalog("a", 1)).rejects.toThrow("Término de búsqueda demasiado corto");
    });

    it("✓ debe delegar al DAO y retornar formato estandarizado", async () => {
        console.log("  -> Verificando delegación al DAO...");
        const fakeProducts = [{ id: 1, name: "Coke" }];
        jest.spyOn(ProductoDAO, 'searchProducts').mockResolvedValue(fakeProducts as any);
        
        const service = new MenuService();
        const result = await service.searchCatalog("Coke", 1);

        expect(result.products).toEqual(fakeProducts);
        jest.restoreAllMocks();
    });
  });
});
