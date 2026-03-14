import { db } from '../../config/db';

describe('SQL Black Box Tests', () => {

  it('should fetch products with primary image', async () => {

    const result = await db.query(`
      SELECT p.id,
             p.name,
             COALESCE(
               pi.image_path,
               '/images/default-product.png'
             ) AS image_display
      FROM products p
      LEFT JOIN product_images pi
        ON pi.product_id = p.id
        AND pi.is_primary = TRUE
      LIMIT 1
    `);

    expect(result.rows).toBeDefined();
  });

  it('should insert image directly via SQL', async () => {
    const result = await db.query(`
        INSERT INTO product_images
        (product_id, image_path, file_name, file_size, format, is_primary)
        VALUES 
        (1, '/uploads/sql-test.jpg', 'sql-test.jpg', 1024, 'jpg', true)
        RETURNING id
    `);

    expect(result.rows[0].id).toBeDefined();
    });

  it('should delete image via SQL', async () => {
    // Insertamos con todos los campos requeridos
    const insert = await db.query(`
        INSERT INTO product_images
        (product_id, image_path, file_name, file_size, format, is_primary)
        VALUES 
        (1, '/uploads/delete-test.jpg', 'delete-test.jpg', 500, 'jpg', false)
        RETURNING id
    `);

    const id = insert.rows[0].id;

    await db.query(`DELETE FROM product_images WHERE id=$1`, [id]);

    const check = await db.query(`SELECT * FROM product_images WHERE id=$1`, [id]);

    expect(check.rows.length).toBe(0);
    });

});