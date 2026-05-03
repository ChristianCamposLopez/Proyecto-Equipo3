// models/daos/DireccionDAO.ts
/**
 * Capa de Persistencia para Direcciones de Entrega
 * US014: Ingresar dirección de entrega
 */

import { db } from "@/config/db";

export class DireccionDAO {
  
  static async getByCustomer(customerId: number) {
    const result = await db.query(
      `SELECT * FROM delivery_addresses WHERE customer_id = $1`,
      [customerId]
    );
    return result.rows;
  }

  static async crear(customerId: number, data: any) {
    const result = await db.query(
      `INSERT INTO delivery_addresses 
       (customer_id, street, exterior_number, interior_number, neighborhood, city, state, postal_code, delivery_references)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        customerId, 
        data.street, 
        data.exteriorNumber, 
        data.interiorNumber || null, 
        data.neighborhood || null, 
        data.city, 
        data.state, 
        data.postalCode, 
        data.references || null
      ]
    );
    return result.rows[0];
  }

  static async actualizar(id: number, data: any) {
    const result = await db.query(
      `UPDATE delivery_addresses 
       SET street = $1, exterior_number = $2, interior_number = $3, neighborhood = $4, city = $5, state = $6, postal_code = $7, delivery_references = $8, updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [
        data.street, 
        data.exteriorNumber, 
        data.interiorNumber || null, 
        data.neighborhood || null, 
        data.city, 
        data.state, 
        data.postalCode, 
        data.references || null,
        id
      ]
    );
    return result.rows[0];
  }

  static async eliminar(id: number) {
    await db.query(`DELETE FROM delivery_addresses WHERE id = $1`, [id]);
  }
}
