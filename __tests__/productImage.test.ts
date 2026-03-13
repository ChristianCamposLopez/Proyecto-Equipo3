// __tests__/productImage.test.ts
// Pruebas unitarias US009 — Gestión Multimedia de Platillos
// Ejecutar con: npx jest productImage

import { ProductImageDAO } from '@/models/daos/ProductImageDAO';
import { db } from '@/config/db';

// Mock del pool de PostgreSQL
jest.mock('@/config/db', () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;
const dao = new ProductImageDAO();

beforeEach(() => jest.clearAllMocks());

// ─── US009.1: getImageByProductId ─────────────────────────────────────────
describe('US009.1 — getImageByProductId', () => {
  it('devuelve la imagen cuando el producto existe', async () => {
    mockQuery.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ product_id: 1, image_url: '/uploads/products/product_1.jpg', image_uploaded_at: new Date() }],
    });

    const result = await dao.getImageByProductId(1);

    expect(result).not.toBeNull();
    expect(result?.image_url).toBe('/uploads/products/product_1.jpg');
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [1]);
  });

  it('devuelve null si el producto no existe', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const result = await dao.getImageByProductId(999);

    expect(result).toBeNull();
  });

  it('devuelve null si la imagen es NULL en BD', async () => {
    mockQuery.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ product_id: 2, image_url: null, image_uploaded_at: null }],
    });

    const result = await dao.getImageByProductId(2);

    expect(result?.image_url).toBeNull();
  });
});

// ─── US009.2: upsertImage ─────────────────────────────────────────────────
describe('US009.2 — upsertImage', () => {
  it('guarda la URL y retorna el registro actualizado', async () => {
    const now = new Date();
    mockQuery.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ product_id: 1, image_url: '/uploads/products/product_1_123.jpg', image_uploaded_at: now }],
    });

    const result = await dao.upsertImage(1, '/uploads/products/product_1_123.jpg');

    expect(result.image_url).toBe('/uploads/products/product_1_123.jpg');
    expect(result.image_uploaded_at).toBe(now);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE products'),
      ['/uploads/products/product_1_123.jpg', 1]
    );
  });

  it('lanza error si el producto no existe', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await expect(dao.upsertImage(999, '/img.jpg')).rejects.toThrow('no encontrado');
  });
});

// ─── US009.3: deleteImage ─────────────────────────────────────────────────
describe('US009.3 — deleteImage', () => {
  it('elimina la imagen correctamente (sin lanzar error)', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [] });

    await expect(dao.deleteImage(1)).resolves.not.toThrow();
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SET image_url = NULL'),
      [1]
    );
  });

  it('lanza error si el producto no existe', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await expect(dao.deleteImage(999)).rejects.toThrow('no encontrado');
  });
});