import { ProductoDAO } from "@/models/daos/ProductoDAO";
import { MenuService } from "@/services/MenuService";
import { db } from "@/config/db";
import { GET } from "@/app/api/platos/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES Y DATOS DE SEMBRADO (Simulación seed.sql)
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

const SEED_DATA = {
  categories: [
    { id: 1, name: "Pizza" },
    { id: 2, name: "Bebidas" },
    { id: 3, name: "Postres" }
  ],
  products: [
    { id: 101, name: "Margherita", base_price: 15.0, category_id: 1, restaurant_id: 1, is_active: true },
    { id: 102, name: "Coca Cola", base_price: 2.5, category_id: 2, restaurant_id: 1, is_active: true },
    { id: 103, name: "Tiramisu", base_price: 5.0, category_id: 3, restaurant_id: 1, is_active: false }
  ]
};

const createRequest = (url: string) => {
  return new Request(url) as unknown as NextRequest;
};

describe("US001: Filtrado de Platos - PRUEBAS DE ROBUSTEZ Y CAMINOS ALTERNATIVOS", () => {
  
  beforeAll(() => {
    console.log(">>> Probando US001: Filtrado de platos (Caminos Alternativos)...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ProductoDAO)
  // =========================================================
  describe("Capa de Persistencia (ProductoDAO)", () => {
    
    it("✓ DEBE filtrar por categoría existente (Camino Feliz)", async () => {
      const pizzaProducts = SEED_DATA.products.filter(p => p.category_id === 1);
      mockQuery.mockResolvedValueOnce({ rows: pizzaProducts });

      const result = await ProductoDAO.getProductsByRestaurant(1, false, 1);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Margherita");
    });

    it("⚠ DEBE retornar vacío si la categoría no tiene productos (Camino Alternativo)", async () => {
      console.log("  -> Verificando categoría sin productos...");
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await ProductoDAO.getProductsByRestaurant(1, false, 999);
      expect(result).toEqual([]);
      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1, false, 999]);
    });

    it("⚠ DEBE manejar restaurante inexistente (Camino Alternativo)", async () => {
      console.log("  -> Verificando restaurante inexistente...");
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await ProductoDAO.getProductsByRestaurant(9999);
      expect(result).toEqual([]);
    });

    it("✗ DEBE propagar error si la DB está caída (Fallo de Infraestructura)", async () => {
      console.log("  -> Verificando fallo de conexión a DB...");
      mockQuery.mockRejectedValueOnce(new Error("ECONNREFUSED"));
      await expect(ProductoDAO.getProductsByRestaurant(1)).rejects.toThrow("ECONNREFUSED");
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS (MenuService)
  // =========================================================
  describe("Capa de Servicios (MenuService)", () => {
    it("✓ DEBE filtrar productos inactivos por defecto (Lógica de Negocio)", async () => {
      const activeProducts = SEED_DATA.products.filter(p => p.is_active);
      const spy = jest.spyOn(ProductoDAO, 'getProductsByRestaurant').mockResolvedValue(activeProducts);

      const service = new MenuService();
      const result = await service.getCatalogProducts(1); // includeInactive = false por defecto

      expect(spy).toHaveBeenCalledWith(1, false, null);
      expect(result.products).toHaveLength(2); // Margherita y Coca Cola
      spy.mockRestore();
    });

    it("✓ DEBE permitir ver productos inactivos si se solicita (Admin View)", async () => {
      const allProducts = SEED_DATA.products;
      const spy = jest.spyOn(ProductoDAO, 'getProductsByRestaurant').mockResolvedValue(allProducts);

      const service = new MenuService();
      const result = await service.getCatalogProducts(1, true); 

      expect(spy).toHaveBeenCalledWith(1, true, null);
      expect(result.products).toHaveLength(3); 
      spy.mockRestore();
    });
  });

  // =========================================================
  // 3. CAPA API (Controllers)
  // =========================================================
  describe("API Route GET /api/platos", () => {
    it("⚠ DEBE manejar parámetros de búsqueda inválidos (Camino Alternativo)", async () => {
      console.log("  -> Verificando parámetros inválidos en URL...");
      // restaurantId es requerido por la lógica pero el test prueba qué pasa si no viene
      mockQuery.mockResolvedValueOnce({ rows: [] });
      
      const req = createRequest("http://localhost/api/platos?restaurantId=NaN");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200); // La API actual no valida tipos estrictos de ID pero retorna vacío
      expect(json.products).toEqual([]);
    });

    it("✗ DEBE retornar 500 ante error interno no controlado", async () => {
      console.log("  -> Verificando respuesta 500 ante crash de servicio...");
      jest.spyOn(ProductoDAO, 'getProductsByRestaurant').mockRejectedValue(new Error("Fatal crash"));
      
      const req = createRequest("http://localhost/api/platos?restaurantId=1");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBe("Internal server error");
      jest.restoreAllMocks();
    });
  });
});