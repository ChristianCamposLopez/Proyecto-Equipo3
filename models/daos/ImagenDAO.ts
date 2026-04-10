// models/daos/ImagenDAO.ts
import { db } from "../../config/db";

export type ProductImage = {
  id: number;
  product_id: number;
  image_path: string;
  file_name: string;
  file_size: number;
  format: string;
  is_primary: boolean;
  created_at: Date;
  deleted_at: Date | null;
};

export class ImagenDAO {
  // Obtener imágenes de un producto (no eliminadas)
  static async getImagesByProductId(productId: number): Promise<ProductImage[]> {
    const result = await db.query(
      `
      SELECT id, image_path, is_primary, file_name, file_size, format, created_at
      FROM product_images
      WHERE product_id = $1 AND deleted_at IS NULL
      ORDER BY is_primary DESC, created_at DESC
      `,
      [productId]
    );
    return result.rows;
  }

  // Desmarcar todas las imágenes como primarias para un producto
  static async unsetPrimaryFlag(productId: number): Promise<void> {
    await db.query(
      `UPDATE product_images SET is_primary = FALSE WHERE product_id = $1`,
      [productId]
    );
  }

  // Insertar una nueva imagen
  static async insertImage(data: {
    productId: number;
    imagePath: string;
    fileName: string;
    fileSize: number;
    format: string;
    isPrimary: boolean;
  }): Promise<ProductImage> {
    const result = await db.query(
      `
      INSERT INTO product_images
      (product_id, image_path, file_name, file_size, format, is_primary)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        data.productId,
        data.imagePath,
        data.fileName,
        data.fileSize,
        data.format,
        data.isPrimary,
      ]
    );
    return result.rows[0];
  }

  // models/daos/ImagenDAO.ts (adiciones)
  static async getById(id: number): Promise<ProductImage | null> {
    const result = await db.query('SELECT * FROM product_images WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<void> {
    await db.query('DELETE FROM product_images WHERE id = $1', [id]);
  }

  static async getNewestByProductId(productId: number): Promise<ProductImage | null> {
    const result = await db.query(
      `SELECT * FROM product_images WHERE product_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [productId]
    );
    return result.rows[0] || null;
  }

  static async setPrimary(id: number): Promise<void> {
    await db.query('UPDATE product_images SET is_primary = TRUE WHERE id = $1', [id]);
  }
}