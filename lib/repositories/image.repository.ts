import { db } from '../../config/db';

export class ImageRepository {

  static async save(
    productId: number,
    path: string,
    isPrimary: boolean
  ) {

    if (isPrimary) {
      await db.query(
        `UPDATE product_images
         SET is_primary = FALSE
         WHERE product_id = $1`,
        [productId]
      );
    }

    return db.query(
      `
      INSERT INTO product_images
      (product_id, image_path, is_primary)
      VALUES ($1,$2,$3)
      RETURNING *
      `,
      [productId, path, isPrimary]
    );
  }

  static async findByProduct(productId: number) {
    return db.query(
      `
      SELECT *
      FROM product_images
      WHERE product_id=$1
      `,
      [productId]
    );
  }

  static async delete(id: number) {
    return db.query(
      `DELETE FROM product_images WHERE id=$1`,
      [id]
    );
  }
}