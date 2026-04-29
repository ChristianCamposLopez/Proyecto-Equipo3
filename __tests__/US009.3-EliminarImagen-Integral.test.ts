import { ImagenDAO } from "@/models/daos/ImagenDAO";
import { ImagenController } from "@/controllers/ImagenController";
import { db } from "@/config/db";
import { DELETE } from "@/app/api/platos/[id]/images/[imageId]/route";
import { NextRequest } from "next/server";
import fs from "fs/promises";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

jest.mock("fs/promises");

const mockQuery = db.query as jest.Mock;
const mockFsUnlink = fs.unlink as jest.Mock;

describe("US009.3: Gestión de Menú – Eliminar imagen (Integral)", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockFsUnlink.mockResolvedValue(undefined);
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ImagenDAO)
  // =========================================================
  describe("Capa de Persistencia (ImagenDAO)", () => {
    
    describe("delete", () => {
      it("✓ debe eliminar físicamente el registro de la BD", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });
        await ImagenDAO.delete(5);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringMatching(/DELETE\s+FROM\s+product_images\s+WHERE\s+id\s+=\s+\$1/i),
          [5]
        );
      });
    });

    describe("getNewestByProductId", () => {
      it("✓ debe retornar la imagen más reciente de un producto", async () => {
        const newest = { id: 10, created_at: new Date() };
        mockQuery.mockResolvedValueOnce({ rows: [newest] });
        
        const result = await ImagenDAO.getNewestByProductId(2);
        
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringMatching(/ORDER\s+BY\s+created_at\s+DESC\s+LIMIT\s+1/i),
          [2]
        );
        expect(result).toEqual(newest);
      });
    });

    describe("setPrimary", () => {
      it("✓ debe marcar una imagen como primaria", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });
        await ImagenDAO.setPrimary(7);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringMatching(/UPDATE\s+product_images\s+SET\s+is_primary\s+=\s+TRUE\s+WHERE\s+id\s+=\s+\$1/i),
          [7]
        );
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Controller & API)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    let controller: ImagenController;
    let spyGetById: jest.SpyInstance;
    let spyDelete: jest.SpyInstance;
    let spyGetNewest: jest.SpyInstance;
    let spySetPrimary: jest.SpyInstance;

    beforeEach(() => {
      controller = new ImagenController();
      // Espiamos los métodos del DAO
      spyGetById = jest.spyOn(ImagenDAO, 'getById');
      spyDelete = jest.spyOn(ImagenDAO, 'delete');
      spyGetNewest = jest.spyOn(ImagenDAO, 'getNewestByProductId');
      spySetPrimary = jest.spyOn(ImagenDAO, 'setPrimary');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe("ImagenController.deleteImage", () => {
      it("✓ debe eliminar imagen (física y BD) y reasignar primaria si era la principal", async () => {
        const image = { id: 10, product_id: 3, image_path: "/uploads/img.jpg", is_primary: true };
        spyGetById.mockResolvedValueOnce(image);
        spyGetNewest.mockResolvedValueOnce({ id: 20 });
        spySetPrimary.mockResolvedValueOnce(true);
        spyDelete.mockResolvedValueOnce(true);

        const result = await controller.deleteImage(10);
        
        expect(mockFsUnlink).toHaveBeenCalledWith(expect.stringContaining("img.jpg"));
        expect(spyDelete).toHaveBeenCalledWith(10);
        expect(spyGetNewest).toHaveBeenCalledWith(3);
        expect(spySetPrimary).toHaveBeenCalledWith(20);
        expect(result).toBe(true);
      });

      it("✓ si la imagen no era primaria, solo se elimina sin reasignar", async () => {
        const image = { id: 10, product_id: 3, image_path: "/uploads/img.jpg", is_primary: false };
        spyGetById.mockResolvedValueOnce(image);
        spyDelete.mockResolvedValueOnce(true);

        await controller.deleteImage(10);
        
        expect(spyGetNewest).not.toHaveBeenCalled();
        expect(spySetPrimary).not.toHaveBeenCalled();
      });

      it("✗ debe lanzar error si la imagen no existe", async () => {
        spyGetById.mockResolvedValueOnce(null);
        
        await expect(controller.deleteImage(999)).rejects.toThrow("Image not found");
        expect(spyDelete).not.toHaveBeenCalled();
      });

      it("✗ debe continuar aunque el archivo físico no exista (solo advertencia)", async () => {
        const image = { id: 10, product_id: 3, image_path: "/uploads/missing.jpg", is_primary: false };
        spyGetById.mockResolvedValueOnce(image);
        mockFsUnlink.mockRejectedValueOnce(new Error("ENOENT")); // File not found on disk
        spyDelete.mockResolvedValueOnce(true);

        await expect(controller.deleteImage(10)).resolves.toBe(true);
        expect(spyDelete).toHaveBeenCalled();
      });
    });

    describe("API DELETE /api/platos/[id]/images/[imageId]", () => {
      const createDeleteReq = (imageId: string) => ({
        params: Promise.resolve({ imageId })
      });

      it("✓ debe retornar 200 si la imagen se elimina correctamente", async () => {
        spyGetById.mockResolvedValueOnce({ id: 1, product_id: 2, image_path: "/a.jpg", is_primary: false });
        spyDelete.mockResolvedValueOnce(true);

        const req = {} as NextRequest;
        const { params } = createDeleteReq("1");
        
        const res = await DELETE(req, { params });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ message: "Image deleted permanently" });
      });

      it("✗ debe retornar 400 si imageId no es número válido", async () => {
        const req = {} as NextRequest;
        const { params } = createDeleteReq("abc");
        
        const res = await DELETE(req, { params });
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json).toEqual({ error: "Invalid image id" });
      });

      it("✗ debe retornar 404 si la imagen no existe", async () => {
        spyGetById.mockResolvedValueOnce(null);
        
        const req = {} as NextRequest;
        const { params } = createDeleteReq("123");
        
        const res = await DELETE(req, { params });
        const json = await res.json();

        expect(res.status).toBe(404);
        expect(json).toEqual({ error: "Image not found" });
      });

      it("✗ debe retornar 500 si ocurre otro error", async () => {
        spyGetById.mockRejectedValueOnce(new Error("DB crash"));
        
        const req = {} as NextRequest;
        const { params } = createDeleteReq("1");
        
        const res = await DELETE(req, { params });
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json).toEqual({ error: "DB crash" });
      });
    });
  });
});