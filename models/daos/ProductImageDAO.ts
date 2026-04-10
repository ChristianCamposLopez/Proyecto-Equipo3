// models/daos/ProductImageDAO.ts
import { db } from '@/config/db';
import { ProductImage } from '../entities/ProductImage';

export class ProductImageDAO {

  // US009.1 — Obtener imagen de un platillo (para el cliente)
  async getImageByProductId(productId: number): Promise<ProductImage | null> {
    const result = await db.query(
      `SELECT id AS product_id, image_url, image_uploaded_at
       FROM products
       WHERE id = $1`,
      [productId]
    );
    if (result.rowCount === 0) return null;
    return result.rows[0] as ProductImage;
  }

  // US009.2 — Guardar/actualizar la URL de imagen de un platillo (admin)
  async upsertImage(productId: number, imageUrl: string): Promise<ProductImage> {
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
    return result.rows[0] as ProductImage;
  }

  // US009.3 — Eliminar imagen de un platillo (admin)
  async deleteImage(productId: number): Promise<void> {
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