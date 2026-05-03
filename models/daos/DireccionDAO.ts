// models/daos/DireccionDAO.ts
/**
 * Capa de Persistencia para Direcciones de Entrega
 * US014: Ingresar dirección de entrega
 */

import { db } from "@/config/db";

export class DireccionDAO {
  
  static async getByCustomer(customerId: number) {
    const result = await db.query(
      `SELECT * FROM delivery_addresses WHERE customer_id = $1 AND deleted_at IS NULL`,
      [customerId]
    );
    return result.rows;
  }

  static async crear(customerId: number, data: {
    name: string;
    address_line: string;
    city: string;
    latitude: number;
    longitude: number;
  }) {
    const result = await db.query(
      `INSERT INTO delivery_addresses (customer_id, name, address_line, city, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [customerId, data.name, data.address_line, data.city, data.latitude, data.longitude]
    );
    return result.rows[0];
  }

  static async eliminar(id: number) {
    await db.query(`UPDATE delivery_addresses SET deleted_at = NOW() WHERE id = $1`, [id]);
  }
}
