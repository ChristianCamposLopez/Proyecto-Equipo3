/**
 * US008: Gestión de Menú – Control de Stock
 * Pruebas sobre la actualización de inventario y disponibilidad.
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

describe("US008: Gestión de Menú – Control de Stock", () => {
  
  beforeAll(() => {
    console.log(">>> Probando US008: Control de Stock Automático...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ProductoDAO.updateStock)
  // =========================================================
  describe("Capa de Persistencia (ProductoDAO.updateStock)", () => {
    
    it("✓ debe actualizar stock e is_available = true si cantidad > 0", async () => {
      console.log("  -> Verificando actualización de stock y disponibilidad automática...");
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      await ProductoDAO.updateStock(1, 10);
      
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE\s+products\s+SET\s+stock\s+=\s+\$1,\s+is_available\s+=\s+\$2\s+WHERE\s+id\s+=\s+\$3/i),
        [10, true, 1]
      );
    });

    it("✓ debe poner is_available = false si el stock llega a 0", async () => {
      console.log("  -> Verificando is_available = false cuando stock es 0...");
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      await ProductoDAO.updateStock(1, 0);
      
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringMatching(/is_available\s+=\s+\$2/i),
        [0, false, 1]
      );
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS (MenuService.updateStock)
  // =========================================================
  describe("Capa de Servicios (MenuService.updateStock)", () => {
    
    it("⚠ debe rechazar stock negativo", async () => {
      console.log("  -> Verificando rechazo de stock negativo...");
      const service = new MenuService();
      await expect(service.updateStock(1, -5)).rejects.toThrow("El stock no puede ser negativo");
    });

    it("✓ debe delegar al DAO correctamente", async () => {
        // Mock findById para que el service pase la validación de existencia
        jest.spyOn(ProductoDAO, 'findByIdIncludingInactive').mockResolvedValue({ id: 1 } as any);
        const spyUpdate = jest.spyOn(ProductoDAO, 'updateStock').mockResolvedValue();
        
        const service = new MenuService();
        await service.updateStock(1, 20);
        
        expect(spyUpdate).toHaveBeenCalledWith(1, 20);
        jest.restoreAllMocks();
    });
  });
});
