import { ImagenDAO } from "@/models/daos/ImagenDAO";
import { ImagenService } from "@/services/ImagenService";
import { db } from "@/config/db";
import { POST } from "@/app/api/platos/[id]/images/route";
import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

jest.mock("fs/promises");
jest.mock("path");

const mockQuery = db.query as jest.Mock;
const mockFsMkdir = fs.mkdir as jest.Mock;
const mockFsWriteFile = fs.writeFile as jest.Mock;

describe("US009.2: Gestión de Menú – Subir imagen (Integral)", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Configuración por defecto para mocks de archivos
    mockFsMkdir.mockResolvedValue(undefined);
    mockFsWriteFile.mockResolvedValue(undefined);
    (path.join as jest.Mock).mockImplementation((...args) => args.join("/"));
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ImagenDAO)
  // =========================================================
  describe("Capa de Persistencia (ImagenDAO)", () => {
    
    describe("unsetPrimaryFlag", () => {
      it("✓ debe poner todas las imágenes del producto como no primarias", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });
        await ImagenDAO.unsetPrimaryFlag(10);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringMatching(/UPDATE\s+product_images\s+SET\s+is_primary\s+=\s+FALSE\s+WHERE\s+product_id\s+=\s+\$1/i),
          [10]
        );
      });
    });

    describe("insertImage", () => {
      it("✓ debe insertar una nueva imagen y devolverla con todos los campos", async () => {
        const newImage = {
          id: 5,
          product_id: 2,
          image_path: "/uploads/pizza.jpg",
          file_name: "pizza.jpg",
          file_size: 1024,
          format: "jpg",
          is_primary: true,
          created_at: new Date(),
        };
        mockQuery.mockResolvedValueOnce({ rows: [newImage] });

        const result = await ImagenDAO.insertImage({
          product_id: 2,
          image_path: "/uploads/pizza.jpg",
          file_name: "pizza.jpg",
          file_size: 1024,
          format: "jpg",
          is_primary: true,
        });

        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toContain("INSERT INTO product_images");
        expect(params).toEqual([2, "/uploads/pizza.jpg", "pizza.jpg", 1024, "jpg", true]);
        expect(result).toEqual(newImage);
      });
    });

    describe("getById", () => {
      it("✓ debe obtener imagen por ID", async () => {
        const image = { id: 1 };
        mockQuery.mockResolvedValueOnce({ rows: [image] });
        const result = await ImagenDAO.getById(1);
        
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringMatching(/SELECT\s+\*\s+FROM\s+product_images\s+WHERE\s+id\s+=\s+\$1/i), 
          [1]
        );
        expect(result).toEqual(image);
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Service & API)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    let controller: ImagenService;
    let spyUnsetPrimary: jest.SpyInstance;
    let spyInsertImage: jest.SpyInstance;

    beforeEach(() => {
      controller = new ImagenService();
      spyUnsetPrimary = jest.spyOn(ImagenDAO, 'unsetPrimaryFlag');
      spyInsertImage = jest.spyOn(ImagenDAO, 'insertImage');
    });

    afterEach(() => {
      spyUnsetPrimary.mockRestore();
      spyInsertImage.mockRestore();
    });

    describe("ImagenService.uploadImage", () => {
      it("✓ debe subir una imagen válida (formato, tamaño <2MB, base64) y guardar en BD", async () => {
        const fakeInserted = { id: 99, image_path: "/uploads/test.png" };
        spyInsertImage.mockResolvedValueOnce(fakeInserted);
        spyUnsetPrimary.mockResolvedValueOnce(undefined);

        const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        const payload = {
          fileName: "test.png",
          data: base64Data,
          format: "png",
          isPrimary: true,
        };

        const result = await controller.uploadImage(1, payload);

        expect(spyUnsetPrimary).toHaveBeenCalledWith(1);
        expect(mockFsMkdir).toHaveBeenCalled();
        expect(mockFsWriteFile).toHaveBeenCalled();
        expect(spyInsertImage).toHaveBeenCalled();
        expect(result).toEqual({ image: fakeInserted });
      });

      it("✗ debe rechazar formato no permitido", async () => {
        await expect(controller.uploadImage(1, { 
          fileName: "test.bmp", data: "xxx", format: "bmp", isPrimary: false 
        })).rejects.toThrow("Format not allowed");
        
        expect(spyInsertImage).not.toHaveBeenCalled();
      });

      it("✗ debe rechazar archivo mayor a 2MB", async () => {
        const largeBase64 = "a".repeat(3 * 1024 * 1024);
        await expect(controller.uploadImage(1, { 
          fileName: "large.jpg", data: largeBase64, format: "jpg", isPrimary: false 
        })).rejects.toThrow("File too large (max 2MB)");
      });
    });

    describe("API POST /api/platos/[id]/images", () => {
      const createPostReq = (body: any) => ({
        json: async () => body
      } as NextRequest);

      it("✓ debe retornar 200 y la imagen creada cuando todo es correcto", async () => {
        spyInsertImage.mockResolvedValueOnce({ id: 55 });
        spyUnsetPrimary.mockResolvedValueOnce(undefined);

        const req = createPostReq({ 
          fileName: "f.png", data: "base64mock", format: "png", isPrimary: false 
        });
        const params = Promise.resolve({ id: "2" });
        
        const res = await POST(req, { params });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.image).toBeDefined();
      });

      it("✗ debe retornar 400 si faltan campos obligatorios", async () => {
        const req = createPostReq({ fileName: "ok.png", data: "xxx" }); // falta format
        const params = Promise.resolve({ id: "1" });
        const res = await POST(req, { params });
        
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "Missing fields" });
      });

      it("✗ debe retornar 400 si ID no es número", async () => {
        const req = createPostReq({ fileName: "a", data: "b", format: "jpg" });
        const params = Promise.resolve({ id: "abc" });
        const res = await POST(req, { params });
        
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "Invalid product id" });
      });

      it("✗ debe retornar error 400 ante formatos inválidos desde el controlador", async () => {
        const req = createPostReq({ fileName: "a", data: "b", format: "bmp" });
        const params = Promise.resolve({ id: "1" });
        const res = await POST(req, { params });
        
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toContain("Format not allowed");
      });
    });
  });
});