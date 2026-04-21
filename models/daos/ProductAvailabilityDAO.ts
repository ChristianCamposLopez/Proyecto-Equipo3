import { db } from '@/config/db';

export type ProductAvailability = {
  id: number;
  name: string;
  stock: number;
  is_available: boolean;
};

export class ProductAvailabilityDAO {
  async updateStock(productId: number, stock: number): Promise<ProductAvailability> {
    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error('El stock debe ser un entero mayor o igual a cero');
    }

    const result = await db.query(
      `UPDATE products
       SET stock = $1,
           is_available = CASE WHEN $1 > 0 THEN TRUE ELSE FALSE END
       WHERE id = $2
       RETURNING id, name, stock, is_available`,
      [stock, productId]
    );

    if (result.rowCount === 0) {
      throw new Error(`Producto con id ${productId} no encontrado`);
    }

    return result.rows[0] as ProductAvailability;
  }
}
