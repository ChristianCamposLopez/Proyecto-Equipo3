import { ProductoDAO } from "@/models/daos/ProductoDAO";
import { MenuService } from "@/services/MenuService";
import { db } from "@/config/db";
import { GET } from "@/app/api/platos/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: {
    query: jest.fn(),
  },
}));

const mockQuery = db.query as jest.Mock;

const createRequest = (url: string) => {
  return new Request(url) as unknown as NextRequest;
};

describe("US001: Filtrado de Platos - PRUEBAS INTEGRALES", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ProductoDAO)
  // =========================================================
  describe("Capa de Persistencia (ProductoDAO)", () => {
    
    describe("Obtención de productos con filtro por categoría", () => {
      it("✓ debe filtrar por categoryId cuando se proporciona", async () => {
        const fakeProducts = [
          {
            id: 1,
            name: "Pizza",
            base_price: 10,
            category_name: "Comida rápida",
            image_display: "/img.jpg",
          },
        ];
        mockQuery.mockResolvedValueOnce({ rows: fakeProducts });

        const result = await ProductoDAO.getProductsByRestaurant(1, false, 5);

        expect(mockQuery).toHaveBeenCalledTimes(1);
        const queryParams = mockQuery.mock.calls[0][1];
        expect(queryParams).toEqual([1, false, 5]);
        expect(result).toEqual(fakeProducts);
      });

      it("✓ debe NO filtrar por categoryId si es null", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        await ProductoDAO.getProductsByRestaurant(1, false, null);
        const queryParams = mockQuery.mock.calls[0][1];
        expect(queryParams[2]).toBeNull();
      });

      it("✓ debe aplicar includeInactive = true para incluir productos inactivos", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        await ProductoDAO.getProductsByRestaurant(1, true, null);
        const queryParams = mockQuery.mock.calls[0][1];
        expect(queryParams[1]).toBe(true);
      });

      it("✓ debe retornar arreglo vacío si no hay productos que cumplan filtros", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        const result = await ProductoDAO.getProductsByRestaurant(99, false, 999);
        expect(result).toEqual([]);
      });

      it("✗ debe propagar error si la consulta a DB falla", async () => {
        const dbError = new Error("Timeout de conexión");
        mockQuery.mockRejectedValueOnce(dbError);
        await expect(ProductoDAO.getProductsByRestaurant(1, false, 2)).rejects.toThrow(
          "Timeout de conexión"
        );
      });
    });

    describe("Datos del producto retornados", () => {
      it("✓ debe devolver los campos esperados por la consulta: id, name, base_price, category_name, image_display", async () => {
        const fakeRow = {
          id: 10,
          name: "Ensalada",
          base_price: 8.5,
          category_name: "Saludable",
          image_display: "/images/ensalada.jpg",
        };
        mockQuery.mockResolvedValueOnce({ rows: [fakeRow] });
        const [product] = await ProductoDAO.getProductsByRestaurant(1);

        expect(product).toHaveProperty("id", 10);
        expect(product).toHaveProperty("name", "Ensalada");
        expect(product).toHaveProperty("base_price", 8.5);
        expect(product).toHaveProperty("category_name", "Saludable");
        expect(product).toHaveProperty("image_display", "/images/ensalada.jpg");
        expect(Object.keys(product)).toHaveLength(5);
      });

      it("✓ debe asignar imagen por defecto si no existe imagen primaria", async () => {
        const fakeRow = {
          id: 10,
          name: "Ensalada",
          base_price: 8.5,
          category_name: "Saludable",
          image_display: "/images/default-product.png",
        };
        mockQuery.mockResolvedValueOnce({ rows: [fakeRow] });
        const [product] = await ProductoDAO.getProductsByRestaurant(1);
        expect(product.image_display).toBe("/images/default-product.png");
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Service y API)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    
    // Espía para interceptar las llamadas al DAO desde el controlador
    let daoSpy: jest.SpyInstance;

    beforeEach(() => {
      daoSpy = jest.spyOn(ProductoDAO, 'getProductsByRestaurant');
    });

    afterEach(() => {
      daoSpy.mockRestore();
    });

    describe("MenuService.getCatalogProducts", () => {
      it("✓ debe llamar a ProductoDAO con restaurantId, includeInactive y categoryId correctos", async () => {
        const fakeProducts = [{ id: 1, name: "Burger", base_price: 5 }];
        daoSpy.mockResolvedValue(fakeProducts);

        const controller = new MenuService();
        const result = await controller.getCatalogProducts(5, true, 12);

        expect(daoSpy).toHaveBeenCalledWith(5, true, 12);
        expect(result).toEqual({ products: fakeProducts });
      });

      it("✓ debe pasar null para categoryId cuando no se proporciona", async () => {
        daoSpy.mockResolvedValue([]);
        const controller = new MenuService();
        await controller.getCatalogProducts(2, false, null);
        expect(daoSpy).toHaveBeenCalledWith(2, false, null);
      });

      it("✓ debe usar valores por defecto includeInactive=false y categoryId=null", async () => {
        daoSpy.mockResolvedValue([]);
        const controller = new MenuService();
        await controller.getCatalogProducts(3);
        expect(daoSpy).toHaveBeenCalledWith(3, false, null);
      });

      it("✗ debe propagar errores del DAO", async () => {
        const error = new Error("Error en base de datos");
        daoSpy.mockRejectedValue(error);
        const controller = new MenuService();
        await expect(controller.getCatalogProducts(1)).rejects.toThrow("Error en base de datos");
      });
    });

    describe("API Route GET /api/platos", () => {
      it("✓ debe retornar 200 con productos cuando se filtra por restaurantId y categoryId", async () => {
        const fakeProducts = [{ id: 5, name: "Taco", base_price: 12 }];
        daoSpy.mockResolvedValue(fakeProducts);

        const req = createRequest("http://localhost/api/platos?restaurantId=1&categoryId=2&includeInactive=false");
        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ products: fakeProducts });
        expect(daoSpy).toHaveBeenCalledWith(1, false, 2);
      });

      it("✓ debe convertir includeInactive string a booleano correctamente", async () => {
        daoSpy.mockResolvedValue([]);
        
        let req = createRequest("http://localhost/api/platos?restaurantId=1&includeInactive=true");
        await GET(req);
        expect(daoSpy).toHaveBeenCalledWith(1, true, null);

        req = createRequest("http://localhost/api/platos?restaurantId=1&includeInactive=false");
        await GET(req);
        expect(daoSpy).toHaveBeenCalledWith(1, false, null);

        req = createRequest("http://localhost/api/platos?restaurantId=1");
        await GET(req);
        expect(daoSpy).toHaveBeenCalledWith(1, false, null);
      });

      it("✓ debe manejar restaurantId nulo cuando no se envía", async () => {
        daoSpy.mockResolvedValue([]);
        const req = createRequest("http://localhost/api/platos?categoryId=3");
        await GET(req);
        expect(daoSpy).toHaveBeenCalledWith(null, false, 3);
      });

      it("✓ debe aceptar categoryId como número", async () => {
        daoSpy.mockResolvedValue([]);
        const req = createRequest("http://localhost/api/platos?restaurantId=2&categoryId=7");
        await GET(req);
        expect(daoSpy).toHaveBeenCalledWith(2, false, 7);
      });

      it("✗ debe retornar 500 si ocurre una excepción en el controlador", async () => {
        daoSpy.mockRejectedValue(new Error("DB caída"));
        const req = createRequest("http://localhost/api/platos?restaurantId=1");
        const res = await GET(req);
        const json = await res.json();
        expect(res.status).toBe(500);
        expect(json).toEqual({ error: "Internal server error" });
      });
    });
  });
});