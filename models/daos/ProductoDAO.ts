// models/daos/ProductoDAO.ts
/*import { db } from "../../config/db";

export interface Producto {
  id: number;
  category_id: number;
  name: string;
  base_price: number;
  is_available: boolean;
  is_active: boolean;
  stock: number;
  deleted_at: Date | null;
  descripcion: string | null;
}

export class ProductoDAO {
  // Obtener producto por ID (solo activos y no eliminados)
  static async findById(id: number): Promise<Producto | null> {
    const query = `
      SELECT * FROM products 
      WHERE id = $1 AND is_active = TRUE AND deleted_at IS NULL
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Obtener producto por ID (incluyendo inactivos/eliminados)
  static async findByIdIncludingInactive(id: number): Promise<Producto | null> {
    const query = `SELECT * FROM products WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Actualizar estado activo/inactivo
  static async updateActiveStatus(id: number, active: boolean): Promise<boolean> {
    const query = `UPDATE products SET is_active = $1 WHERE id = $2`;
    const result = await db.query(query, [active, id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Actualizar precio
  static async updatePrice(id: number, price: number): Promise<void> {
    await db.query(`UPDATE products SET base_price = $1 WHERE id = $2`, [price, id]);
  }

  // Actualizar stock
  static async updateStock(id: number, quantity: number): Promise<void> {
    await db.query(`UPDATE products SET stock = $1 WHERE id = $2`, [quantity, id]);
  }

  // Eliminación lógica
  static async logicalDelete(id: number): Promise<boolean> {
    const query = `UPDATE products SET deleted_at = NOW() WHERE id = $1`;
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Crear nuevo producto
  static async createProduct(data: {
    name: string;
    base_price: number;
    stock: number;
    category_id: number;
    descripcion?: string | null;
  }): Promise<Producto> {
    const query = `
      INSERT INTO products 
      (name, base_price, stock, category_id, descripcion, is_active, is_available)
      VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)
      RETURNING *
    `;
    const values = [data.name, data.base_price, data.stock, data.category_id, data.descripcion ?? null];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Buscar por nombre (case-insensitive)
  static async findByName(name: string): Promise<Producto | null> {
    const query = `SELECT * FROM products WHERE LOWER(name) = LOWER($1)`;
    const result = await db.query(query, [name]);
    return result.rows[0] || null;
  }

  // Actualizar nombre y/o descripción
  static async updateProduct(id: number, data: { name?: string; descripcion?: string }): Promise<Producto> {
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
      throw new Error('No hay datos para actualizar');
    }
    values.push(id);
    const query = `
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Obtener productos por restaurante (para el catálogo) se agregó filtro por categoría USOO1 (Sprint 6)
  static async getProductsByRestaurant(
      restaurantId: number | null,
      includeInactive: boolean = false,
      categoryId: number | null = null
    ): Promise<any[]> {

      const query = `
        SELECT
          p.id,
          p.name,
          p.base_price,
          p.is_active,
          c.name AS category_name,

          COALESCE(
            (
              SELECT pi.image_path
              FROM product_images pi
              WHERE pi.product_id = p.id
                AND pi.is_primary = TRUE
                AND pi.deleted_at IS NULL
              LIMIT 1
            ),
            '/images/default-product.png'
          ) AS image_display

        FROM products p
        JOIN categories c ON p.category_id = c.id

        WHERE
          p.deleted_at IS NULL
          AND p.is_available = TRUE
          AND ($2::boolean = TRUE OR p.is_active = TRUE)
          AND ($1::int IS NULL OR c.restaurant_id = $1)

          -- 🔥 FILTRO POR CATEGORÍA
          AND ($3::int IS NULL OR p.category_id = $3)

        ORDER BY p.id
      `;

      const result = await db.query(query, [
        restaurantId,
        includeInactive,
        categoryId
      ]);

      return result.rows;
    }

   static async getProductById(id: number): Promise<Producto | null> {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Para actualizar nombre y descripción específicos (aunque updateProduct ya lo hace)
  static async updateNombre(id: number, name: string): Promise<Producto> {
    const result = await db.query(
      'UPDATE products SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    return result.rows[0];
  }

  static async updateDescripcion(id: number, descripcion: string | null): Promise<Producto> {
    const result = await db.query(
      'UPDATE products SET descripcion = $1 WHERE id = $2 RETURNING *',
      [descripcion, id]
    );
    return result.rows[0];
  }
}*/

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

  static async updateStock(id: number, quantity: number): Promise<void> {

    await db.query(
      `UPDATE products SET stock = $1 WHERE id = $2`,
      [quantity, id]
    );
  }

  static async logicalDelete(id: number): Promise<boolean> {

    const result = await db.query(
      `UPDATE products SET deleted_at = NOW() WHERE id = $1`,
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  }

  static async createProduct(data: {
    name: string;
    base_price: number;
    stock: number;
    category_id: number;
    descripcion?: string | null;
  }): Promise<ProductoEntity> {

    const result = await db.query(
      `
      INSERT INTO products 
        (name, base_price, stock, category_id, descripcion, is_active, is_available)
      VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)
      RETURNING *
      `,
      [
        data.name,
        data.base_price,
        data.stock,
        data.category_id,
        data.descripcion ?? null
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

  static async updateProduct(
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
      AND p.is_available = TRUE
      AND ($2::boolean = TRUE OR p.is_active = TRUE)
      AND ($1::int IS NULL OR c.restaurant_id = $1)
      AND ($3::int IS NULL OR p.category_id = $3)

      -- 🔥 LÓGICA DE DISPONIBILIDAD (US020) --
      AND (
        $2::boolean = TRUE -- 1. Si es admin, mostrar todo
        OR 
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
  /*
  static async updateNombre(id: number, name: string): Promise<ProductoEntity> {

    const result = await db.query(
      `UPDATE products SET name = $1 WHERE id = $2 RETURNING *`,
      [name, id]
    );

    return result.rows[0];
  }

  static async updateDescripcion(
    id: number,
    descripcion: string | null
  ): Promise<ProductoEntity> {

    const result = await db.query(
      `UPDATE products SET descripcion = $1 WHERE id = $2 RETURNING *`,
      [descripcion, id]
    );

    return result.rows[0];
  }
    */
}
