// models/daos/ImagenDAO.ts
/**
 * Capa de Persistencia para Imágenes
 * US009: Visualización y gestión de imágenes de platillos
 */
import { db } from "@/config/db";
import { ImagenEntity } from "@/models/entities";

export class ImagenDAO {

  /**
   * Obtener imágenes de un producto (no eliminadas)
   */
  static async getImagesByProductId(
    productId: number
  ): Promise<ImagenEntity[]> {

    const result = await db.query(
      `
      SELECT 
        id, 
        product_id,
        image_path, 
        file_name,
        file_size,
        format,
        is_primary,
        created_at,
        deleted_at
      FROM product_images
      WHERE product_id = $1 
        AND deleted_at IS NULL
      ORDER BY is_primary DESC, created_at DESC
      `,
      [productId]
    );

    return result.rows;
  }

  /**
   * Desmarcar todas las imágenes como primarias para un producto
   */
  static async unsetPrimaryFlag(productId: number): Promise<void> {
    await db.query(
      `
      UPDATE product_images 
      SET is_primary = FALSE 
      WHERE product_id = $1
      `,
      [productId]
    );
  }

  /**
   * Insertar una nueva imagen vinculada a un producto
   */
  static async insertImage(data: {
    product_id: number;
    image_path: string;
    file_name: string;
    file_size: number;
    format: string;
    is_primary: boolean;
  }): Promise<ImagenEntity> {

    const result = await db.query(
      `
      INSERT INTO product_images
      (product_id, image_path, file_name, file_size, format, is_primary)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id, product_id, image_path, file_name,
        file_size, format, is_primary, created_at, deleted_at
      `,
      [
        data.product_id,
        data.image_path,
        data.file_name,
        data.file_size,
        data.format,
        data.is_primary,
      ]
    );

    return result.rows[0];
  }

  static async getById(id: number): Promise<ImagenEntity | null> {

    const result = await db.query(
      `
      SELECT * 
      FROM product_images 
      WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<void> {

    await db.query(
      `
      DELETE FROM product_images 
      WHERE id = $1
      `,
      [id]
    );
  }

  static async getNewestByProductId(
    productId: number
  ): Promise<ImagenEntity | null> {

    const result = await db.query(
      `
      SELECT * 
      FROM product_images 
      WHERE product_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
      `,
      [productId]
    );

    return result.rows[0] || null;
  }

  static async setPrimary(id: number): Promise<void> {

    await db.query(
      `
      UPDATE product_images 
      SET is_primary = TRUE 
      WHERE id = $1
      `,
      [id]
    );
  }
}