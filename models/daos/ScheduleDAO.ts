// models/daos/ScheduleDAO.ts
// Capa de persistencia — US020: Control de Disponibilidad Horaria

import { db } from '@/config/db';
import { Schedule } from '@/models/entities/Schedule';

/**
 * ScheduleDAO — CRUD de horarios de disponibilidad de platillos.
 * US020: Sistema base de disponibilidad horaria
 * US020.1: Alta de rangos horarios
 * US020.2: Edición de rangos horarios
 * US020.3: Eliminación de rangos horarios
 * US020.4: Consulta de todos los horarios
 */
export class ScheduleDAO {

  /**
   * US020.4: Obtiene todos los horarios con nombre de producto.
   */
  async getAll(): Promise<Schedule[]> {
    const result = await db.query(`
      SELECT
        ps.id,
        ps.product_id,
        p.name AS product_name,
        ps.day_of_week,
        ps.start_time::text AS start_time,
        ps.end_time::text AS end_time,
        ps.created_at
      FROM product_schedules ps
      JOIN products p ON ps.product_id = p.id
      ORDER BY p.name, ps.day_of_week, ps.start_time
    `);
    return result.rows as Schedule[];
  }

  /**
   * Obtiene horarios de un producto específico.
   */
  async getByProductId(productId: number): Promise<Schedule[]> {
    const result = await db.query(`
      SELECT
        ps.id,
        ps.product_id,
        p.name AS product_name,
        ps.day_of_week,
        ps.start_time::text AS start_time,
        ps.end_time::text AS end_time,
        ps.created_at
      FROM product_schedules ps
      JOIN products p ON ps.product_id = p.id
      WHERE ps.product_id = $1
      ORDER BY ps.day_of_week, ps.start_time
    `, [productId]);
    return result.rows as Schedule[];
  }

  /**
   * US020.1: Crea un nuevo rango horario para un producto.
   */
  async create(
    productId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): Promise<Schedule> {
    const result = await db.query(`
      INSERT INTO product_schedules (product_id, day_of_week, start_time, end_time)
      VALUES ($1, $2, $3, $4)
      RETURNING id, product_id, day_of_week, start_time::text AS start_time, end_time::text AS end_time
    `, [productId, dayOfWeek, startTime, endTime]);
    return result.rows[0] as Schedule;
  }

  /**
   * US020.2: Edita un rango horario existente.
   */
  async update(
    id: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): Promise<Schedule> {
    const result = await db.query(`
      UPDATE product_schedules
      SET day_of_week = $2, start_time = $3, end_time = $4
      WHERE id = $1
      RETURNING id, product_id, day_of_week, start_time::text AS start_time, end_time::text AS end_time
    `, [id, dayOfWeek, startTime, endTime]);

    if (result.rowCount === 0) {
      throw new Error(`Horario con id ${id} no encontrado`);
    }
    return result.rows[0] as Schedule;
  }

  /**
   * US020.3: Elimina un rango horario.
   */
  async delete(id: number): Promise<void> {
    const result = await db.query(
      'DELETE FROM product_schedules WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0) {
      throw new Error(`Horario con id ${id} no encontrado`);
    }
  }

  /**
   * US020: Obtiene los IDs de productos disponibles según día y hora actual.
   * Productos SIN horarios se consideran siempre disponibles.
   */
  async getAvailableProductIds(dayOfWeek: number, currentTime: string): Promise<number[]> {
    const result = await db.query(`
      SELECT DISTINCT p.id
      FROM products p
      WHERE p.is_available = TRUE
        AND (
          -- Productos sin horario asignado = siempre disponibles
          NOT EXISTS (SELECT 1 FROM product_schedules ps WHERE ps.product_id = p.id)
          OR
          -- Productos con horario activo ahora
          EXISTS (
            SELECT 1 FROM product_schedules ps
            WHERE ps.product_id = p.id
              AND ps.day_of_week = $1
              AND ps.start_time <= $2::time
              AND ps.end_time >= $2::time
          )
        )
    `, [dayOfWeek, currentTime]);
    return result.rows.map((r: { id: number }) => r.id);
  }
}
