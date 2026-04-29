import { ImagenDAO } from "@/models/daos/ImagenDAO";
import { ImagenController } from "@/controllers/ImagenController";
import { db } from "@/config/db";
import { GET } from "@/app/api/platos/[id]/images/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

describe("US009.1: Gestión de Menú – Visualizar imágenes (Integral)", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ImagenDAO)
  // =========================================================
  describe("Capa de Persistencia (ImagenDAO)", () => {
    
    describe("getImagesByProductId", () => {
      it("✓ debe retornar las imágenes activas de un producto ordenadas por is_primary DESC, created_at DESC", async () => {
        const fakeImages = [
          { id: 1, product_id: 10, is_primary: true, created_at: new Date() },
          { id: 2, product_id: 10, is_primary: false, created_at: new Date() },
        ];
        mockQuery.mockResolvedValueOnce({ rows: fakeImages });

        const result = await ImagenDAO.getImagesByProductId(10);
        
        expect(mockQuery).toHaveBeenCalledTimes(1);
        const [sql, params] = mockQuery.mock.calls[0];
        
        expect(sql).toContain("WHERE product_id = $1");
        expect(sql).toContain("AND deleted_at IS NULL");
        expect(sql).toContain("ORDER BY is_primary DESC, created_at DESC");
        expect(params).toEqual([10]);
        expect(result).toEqual(fakeImages);
      });

      it("✓ debe retornar un arreglo vacío si el producto no tiene imágenes", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        const result = await ImagenDAO.getImagesByProductId(99);
        expect(result).toEqual([]);
      });

      it("✗ debe propagar el error si la BD falla", async () => {
        mockQuery.mockRejectedValueOnce(new Error("Timeout"));
        await expect(ImagenDAO.getImagesByProductId(1)).rejects.toThrow("Timeout");
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (ImagenController + API)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    let controller: ImagenController;
    let spyGetImages: jest.SpyInstance;

    beforeEach(() => {
      controller = new ImagenController();
      // Espiamos el DAO para controlar las respuestas en la capa de API
      spyGetImages = jest.spyOn(ImagenDAO, 'getImagesByProductId');
    });

    afterEach(() => {
      spyGetImages.mockRestore();
    });

    describe("ImagenController.getImages", () => {
      it("✓ debe retornar el objeto { images } con las imágenes del producto", async () => {
        const fakeImages = [{ id: 1, image_path: "/img.jpg" }];
        spyGetImages.mockResolvedValueOnce(fakeImages);
        
        const result = await controller.getImages(5);
        
        expect(spyGetImages).toHaveBeenCalledWith(5);
        expect(result).toEqual({ images: fakeImages });
      });

      it("✗ debe propagar errores del DAO", async () => {
        spyGetImages.mockRejectedValueOnce(new Error("DB error"));
        await expect(controller.getImages(1)).rejects.toThrow("DB error");
      });
    });

    describe("API GET /api/platos/[id]/images", () => {
      const createParams = (productId: string) => ({
        params: Promise.resolve({ id: productId })
      });

      it("✓ debe retornar 200 con las imágenes cuando el ID es válido", async () => {
        const fakeImages = [{ id: 10, image_path: "/test.png" }];
        spyGetImages.mockResolvedValueOnce(fakeImages);
        
        const req = {} as NextRequest;
        const { params } = createParams("5");
        
        const res = await GET(req, { params });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ images: fakeImages });
        expect(spyGetImages).toHaveBeenCalledWith(5);
      });

      it("✗ debe retornar 400 si el productId no es número", async () => {
        const req = {} as NextRequest;
        const { params } = createParams("abc");
        
        const res = await GET(req, { params });
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json).toEqual({ error: "Invalid product id" });
        expect(spyGetImages).not.toHaveBeenCalled();
      });

      it("✗ debe retornar 500 si el controlador lanza error", async () => {
        spyGetImages.mockRejectedValueOnce(new Error("DB fail"));
        
        const req = {} as NextRequest;
        const { params } = createParams("1");
        
        const res = await GET(req, { params });
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json).toEqual({ error: "Internal server error" });
      });
    });
  });
});