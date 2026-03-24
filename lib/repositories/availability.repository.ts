import { db } from '@/config/db';

export interface Availability {
  id: number;
  product_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export class AvailabilityRepository {

  /* =========================================
     Obtener horarios por producto
  ========================================= */
  async getByProductId(productId: number): Promise<Availability[]> {
    const result = await db.query(
      `
      SELECT id, product_id, day_of_week, start_time, end_time
      FROM product_availability
      WHERE product_id = $1
      ORDER BY day_of_week, start_time
      `,
      [productId]
    );

    return result.rows;
  }

  /* =========================================
     Crear horario
  ========================================= */
  async create(data: {
    productId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }): Promise<Availability> {
    const result = await db.query(
      `
      INSERT INTO product_availability
      (product_id, day_of_week, start_time, end_time)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [data.productId, data.dayOfWeek, data.startTime, data.endTime]
    );

    return result.rows[0];
  }

  /* =========================================
     Actualizar horario
  ========================================= */
  async update(
    id: number,
    data: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }
  ): Promise<Availability> {
    const result = await db.query(
      `
      UPDATE product_availability
      SET day_of_week = $2,
          start_time = $3,
          end_time = $4
      WHERE id = $1
      RETURNING *
      `,
      [id, data.dayOfWeek, data.startTime, data.endTime]
    );

    return result.rows[0];
  }

  /* =========================================
     Eliminar horario
  ========================================= */
  async delete(id: number): Promise<boolean> {
    const result = await db.query(
      `
      DELETE FROM product_availability
      WHERE id = $1
      `,
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  }

  /* =========================================
     Validar solapamiento (crear)
  ========================================= */
  async hasOverlapCreate(
    productId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const result = await db.query(
      `
      SELECT 1
      FROM product_availability
      WHERE product_id = $1
        AND day_of_week = $2
        AND (start_time < $4 AND end_time > $3)
      LIMIT 1
      `,
      [productId, dayOfWeek, startTime, endTime]
    );

    return (result.rowCount ?? 0) > 0;
  }

  /* =========================================
     Validar solapamiento (update)
  ========================================= */
  async hasOverlapUpdate(
    id: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const result = await db.query(
      `
      SELECT 1
      FROM product_availability
      WHERE id != $1
        AND day_of_week = $2
        AND (start_time < $4 AND end_time > $3)
      LIMIT 1
      `,
      [id, dayOfWeek, startTime, endTime]
    );

    return (result.rowCount ?? 0) > 0;
  }
}