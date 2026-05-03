// models/daos/ProductImageDAO.ts
import { db } from '@/config/db';
import { ProductImageEntity } from '@/models/entities';

export class ProductImageDAO {

  // US009.1 — Obtener imagen de un platillo (para el cliente)
  static async getImageByProductId(productId: number): Promise<ProductImageEntity | null> {
    const result = await db.query(
      `SELECT id AS product_id, image_url, image_uploaded_at
       FROM products
       WHERE id = $1`,
      [productId]
    );
    if (result.rowCount === 0) return null;
    return result.rows[0] as ProductImageEntity;
  }

  // US009.2 — Guardar/actualizar la URL de imagen de un platillo (admin)
  static async upsertImage(productId: number, imageUrl: string): Promise<ProductImageEntity> {
    const result = await db.query(
      `UPDATE products
       SET image_url = $1, image_uploaded_at = NOW()
       WHERE id = $2
       RETURNING id AS product_id, image_url, image_uploaded_at`,
      [imageUrl, productId]
    );
    if (result.rowCount === 0) {
      throw new Error(`Producto con id ${productId} no encontrado`);
    }
    return result.rows[0] as ProductImageEntity;
  }

  // US009.3 — Eliminar imagen de un platillo (admin)
  static async deleteImage(productId: number): Promise<void> {
    const result = await db.query(
      `UPDATE products
       SET image_url = NULL, image_uploaded_at = NULL
       WHERE id = $1`,
      [productId]
    );
    if (result.rowCount === 0) {
      throw new Error(`Producto con id ${productId} no encontrado`);
    }
  }
}