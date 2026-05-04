// models/daos/ProductoDAO.ts
import { db } from "@/config/db";
import { ProductoEntity } from "../entities/ProductoEntity";


export class ProductoDAO {

  static async findById(id: number): Promise<ProductoEntity | null> {

    const result = await db.query(
      `
      SELECT * 
      FROM products 
      WHERE id = $1 
        AND is_active = TRUE 
        AND deleted_at IS NULL
      `,
      [id]
    );

    return result.rows[0] || null;
  }

  static async findByIdIncludingInactive(
    id: number
  ): Promise<ProductoEntity | null> {

    const result = await db.query(
      `SELECT * FROM products WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  static async updateActiveStatus(
    id: number,
    active: boolean
  ): Promise<boolean> {

    const result = await db.query(
      `UPDATE products SET is_active = $1 WHERE id = $2`,
      [active, id]
    );

    return (result.rowCount ?? 0) > 0;
  }

  static async updatePrice(id: number, price: number): Promise<void> {

    await db.query(
      `UPDATE products SET base_price = $1 WHERE id = $2`,
      [price, id]
    );
  }

  // models/daos/ProductoDAO.ts

  static async updateStock(id: number, quantity: number): Promise<void> {
    // Calculamos la disponibilidad basada en la cantidad
    const isAvailable = quantity > 0;

    await db.query(
      `UPDATE products 
      SET stock = $1, 
          is_available = $2 
      WHERE id = $3`,
      [quantity, isAvailable, id]
    );
  }

  static async logicalDelete(id: number): Promise<boolean> {

    const result = await db.query(
      `UPDATE products SET deleted_at = NOW() WHERE id = $1`,
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  }

  static async createProductoEntity(data: {
    name: string;
    base_price: number;
    stock: number;
    category_id: number;
    descripcion?: string | null;
  }): Promise<ProductoEntity> {

    const isAvailable = data.stock > 0;
    const result = await db.query(
      `
      INSERT INTO products 
        (name, base_price, stock, category_id, descripcion, is_active, is_available)
      VALUES ($1, $2, $3, $4, $5, TRUE, $6)
      RETURNING *
      `,
      [
        data.name,
        data.base_price,
        data.stock,
        data.category_id,
        data.descripcion ?? null,
        isAvailable
      ]
    );


    return result.rows[0];
  }

  static async findByName(name: string): Promise<ProductoEntity | null> {

    const result = await db.query(
      `SELECT * FROM products WHERE LOWER(name) = LOWER($1)`,
      [name]
    );

    return result.rows[0] || null;
  }

  static async updateProductoEntity(
    id: number,
    data: { name?: string; descripcion?: string }
  ): Promise<ProductoEntity> {

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(data.name);
    }

    if (data.descripcion !== undefined) {
      fields.push(`descripcion = $${index++}`);
      values.push(data.descripcion);
    }

    if (fields.length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    values.push(id);

    const query = `
      UPDATE products
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `;

    const result = await db.query(query, values);

    return result.rows[0];
  }

  static async getProductsByRestaurant(
    restaurantId: number | null,
    includeInactive: boolean = false,
    categoryId: number | null = null
  ): Promise<any[]> {

    const result = await db.query(
      `
     SELECT
      p.id,
      p.name,
      p.base_price,
      p.is_active,
      p.is_available,
      p.descripcion,
      c.name AS category_name,
      COALESCE(
        (SELECT pi.image_path FROM product_images pi 
         WHERE pi.product_id = p.id AND pi.is_primary = TRUE AND pi.deleted_at IS NULL LIMIT 1),
        '/images/default-product.png'
      ) AS image_display
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE
      p.deleted_at IS NULL
      AND ($2::boolean = TRUE OR (p.is_available = TRUE AND p.is_active = TRUE))
      AND ($1::int IS NULL OR c.restaurant_id = $1)
      AND ($3::int IS NULL OR p.category_id = $3)

      -- 🔥 LÓGICA DE DISPONIBILIDAD (US020) --
      AND (
        $2::boolean = TRUE -- 1. Si es admin, mostrar todo
        OR 
        (
          NOT EXISTS (SELECT 1 FROM product_availability WHERE product_id = p.id) -- 2. Si NO tiene reglas, mostrar todo
          OR 
          EXISTS ( -- 3. Si TIENE reglas, validar día y hora actual
              SELECT 1 
              FROM product_availability pa 
              WHERE pa.product_id = p.id
                AND pa.day_of_week = EXTRACT(DOW FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')::int
                AND (CURRENT_TIME AT TIME ZONE 'America/Mexico_City') BETWEEN pa.start_time AND pa.end_time
          )
        )
      )

    ORDER BY p.id
      `,
      [restaurantId, includeInactive, categoryId]
    );

    return result.rows;
  }

  static async getProductById(id: number): Promise<ProductoEntity | null> {

    const result = await db.query(
      `SELECT * FROM products WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  static async searchProducts(term: string, restaurantId?: number): Promise<any[]> {
    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL
        AND (p.name ILIKE $1 OR p.descripcion ILIKE $1)
        AND ($2::int IS NULL OR c.restaurant_id = $2)
      ORDER BY p.name ASC
    `;
    const result = await db.query(query, [`%${term}%`, restaurantId || null]);
    return result.rows;
  }
}
