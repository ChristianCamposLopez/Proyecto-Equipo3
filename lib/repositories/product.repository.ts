import { db } from '../../config/db';

export interface Product {
  id: number;
  category_id: number;
  name: string;
  base_price: number;
  is_available: boolean;
  is_active: boolean;
  stock: number;
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
}