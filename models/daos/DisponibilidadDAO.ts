// models/daos/DisponibilidadDAO.ts
/**
 * Capa de Persistencia para Disponibilidad Horaria
 * US020: Horarios de disponibilidad de platillos
 */
import { db } from "@/config/db";
import { DisponibilidadEntity } from "@/models/entities";

export class DisponibilidadDAO {

  static async getByProductId(productId: number): Promise<DisponibilidadEntity[]> {
    const result = await db.query(
      `SELECT id, product_id, day_of_week, start_time, end_time
       FROM product_availability
       WHERE product_id = $1
       ORDER BY day_of_week, start_time`,
      [productId]
    );

    return result.rows;
  }

  static async getById(id: number): Promise<DisponibilidadEntity | null> {
    const result = await db.query(
      `SELECT id, product_id, day_of_week, start_time, end_time
       FROM product_availability
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  static async create(data: {
    product_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }): Promise<DisponibilidadEntity> {

    const result = await db.query(
      `INSERT INTO product_availability
       (product_id, day_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING id, product_id, day_of_week, start_time, end_time`,
      [data.product_id, data.day_of_week, data.start_time, data.end_time]
    );

    return result.rows[0];
  }

  static async update(
    id: number,
    data: {
      day_of_week: number;
      start_time: string;
      end_time: string;
    }
  ): Promise<DisponibilidadEntity | null> {

    const result = await db.query(
      `UPDATE product_availability
       SET day_of_week = $2,
           start_time = $3,
           end_time = $4
       WHERE id = $1
       RETURNING id, product_id, day_of_week, start_time, end_time`,
      [id, data.day_of_week, data.start_time, data.end_time]
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.query(
      `DELETE FROM product_availability WHERE id = $1`,
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  }

  static async hasOverlap(
    productId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: number
  ): Promise<boolean> {

    let query = `
      SELECT 1
      FROM product_availability
      WHERE product_id = $1
        AND day_of_week = $2
        AND (start_time < $4 AND end_time > $3)
    `;

    const params: any[] = [productId, dayOfWeek, startTime, endTime];

    if (excludeId !== undefined) {
      query += ` AND id != $5`;
      params.push(excludeId);
    }

    query += ` LIMIT 1`;

    const result = await db.query(query, params);

    return (result.rowCount ?? 0) > 0;
  }
}