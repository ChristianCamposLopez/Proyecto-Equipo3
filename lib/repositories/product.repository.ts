//lib/repositories/product.repository.ts
import { db } from '../../config/db';

export interface Product {
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

export interface ProductAvailability {
  id: number;
  product_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: Date;
}

export class ProductRepository {
  async findById(id: number): Promise<Product | null> {
    const query = `
      SELECT * 
      FROM products 
      WHERE id = $1 AND is_active = TRUE AND deleted_at IS NULL
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async findById_2(id: number): Promise<Product | null> {
    const query = `
      SELECT * 
      FROM products 
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async updateActiveStatus(id: number, active: boolean): Promise<boolean> {
    const query = `
      UPDATE products 
      SET is_active = $1 
      WHERE id = $2
    `;

    const result = await db.query(query, [active, id]);

    // Esto siempre devolverá true o false
    return (result.rowCount ?? 0) > 0;
  }
  
  async updatePrice(id: number, price: number): Promise<void> {
    const query = 'UPDATE products SET base_price = $1 WHERE id = $2';
    await db.query(query, [price, id]);
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    const query = 'UPDATE products SET stock = $1 WHERE id = $2';
    await db.query(query, [quantity, id]);
  }

  async logicalDelete(id: number): Promise<boolean> {

    const query = `
      UPDATE products
      SET deleted_at = NOW()
      WHERE id = $1
    `;

    const result = await db.query(query, [id]);

    return (result.rowCount ?? 0) > 0;

  }

  async createProduct(data: {
    name: string;
    base_price: number;
    stock: number;
    category_id: number;
    descripcion?: string | null;
  }): Promise<Product> {

    const query = `
      INSERT INTO products 
      (name, base_price, stock, category_id, descripcion, is_active, is_available)
      VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)
      RETURNING *
    `;

    const values = [
      data.name,
      data.base_price,
      data.stock,
      data.category_id,
      data.descripcion ?? null
    ];

    const result = await db.query(query, values);

    return result.rows[0];
  }

  async findByName(name: string): Promise<Product | null> {
    const query = `
      SELECT *
      FROM products
      WHERE LOWER(name) = LOWER($1)
    `;

    const result = await db.query(query, [name]);
    return result.rows[0] || null;
  }

  async updateProduct(
    id: number,
    data: { name?: string; descripcion?: string }
  ) {
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

}