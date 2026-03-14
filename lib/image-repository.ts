import { db } from '../config/db';

export class ImageRepository {
  static async save(
    productId: number,
    path: string,
    fileName: string, // Agregado según el test
    fileSize: number, // Agregado según el test
    format: string,   // Agregado según el test
    isPrimary: boolean
  ) {
    // Lógica para asegurar que solo haya una imagen primaria por producto
    if (isPrimary) {
      await db.query(
        `UPDATE product_images SET is_primary = FALSE WHERE product_id = $1`,
        [productId]
      );
    }

    // El test espera que el resultado tenga propiedades como .id y .product_id
    // Asumiendo que db.query devuelve una estructura con .rows[0] (típico en pg)
    const result = await db.query(
      `INSERT INTO product_images 
      (product_id, image_path, file_name, file_size, format, is_primary) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [productId, path, fileName, fileSize, format, isPrimary]
    );

    return result.rows[0]; 
  }

  // Renombrado para coincidir con el test: findByProductId
  static async findByProductId(productId: number) {
    const result = await db.query(
      `SELECT * FROM product_images WHERE product_id = $1`,
      [productId]
    );
    return result.rows;
  }

  static async delete(id: number) {
    const result = await db.query(
      `DELETE FROM product_images WHERE id = $1`,
      [id]
    );
    // Si result es null, undefined o no tiene rowCount, devuelve false
    return (result?.rowCount ?? 0) > 0; // Devuelve true si se eliminó algo
  }
}