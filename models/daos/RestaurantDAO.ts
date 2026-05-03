// models/daos/RestaurantDAO.ts
/**
 * Capa de persistencia para Gestión de Restaurantes
 * 
 * Historias de Usuario:
 * - US025.1: Registrar restaurante
 * - US025.2: Modificación de datos
 * - US025.4: Definir horario
 * - US025.5: Apertura/Cierre y Activación
 * - US025.7: Consulta de Perfil
 */

import { db } from '@/config/db';
import { RestaurantEntity, RestaurantHours } from '@/models/entities';

export class RestaurantDAO {

  /**
   * Registra un nuevo restaurante
   * US025.1
   */
  static async crearRestaurantEntity(data: {
    owner_user_id: number;
    name: string;
    latitude?: number;
    longitude?: number;
    tax_id?: string;
  }): Promise<RestaurantEntity> {
    const result = await db.query(
      `INSERT INTO restaurants (owner_user_id, name, latitude, longitude, tax_id, logo_url) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.owner_user_id, data.name, data.latitude, data.longitude, data.tax_id, null]
    );
    const f = result.rows[0];
    return new RestaurantEntity(f.id, f.owner_user_id, f.name, f.tax_id, f.is_active, f.latitude, f.longitude, f.logo_url);
  }

  /**
   * Obtiene un restaurante por ID
   * US025.7
   */
  static async findById(id: number): Promise<RestaurantEntity | null> {
    const result = await db.query(`SELECT * FROM restaurants WHERE id = $1`, [id]);
    if (result.rowCount === 0) return null;
    const f = result.rows[0];
    return new RestaurantEntity(f.id, f.owner_user_id, f.name, f.tax_id, f.is_active, f.latitude, f.longitude, f.logo_url);
  }

  /**
   * Obtiene el restaurante de un dueño
   */
  static async findByOwner(ownerId: number): Promise<RestaurantEntity | null> {
    const result = await db.query(`SELECT * FROM restaurants WHERE owner_user_id = $1`, [ownerId]);
    if (result.rowCount === 0) return null;
    const f = result.rows[0];
    return new RestaurantEntity(f.id, f.owner_user_id, f.name, f.tax_id, f.is_active, f.latitude, f.longitude, f.logo_url);
  }

  /**
   * Actualiza datos del restaurante
   * US025.2 / US025.5
   */
  static async actualizarRestaurantEntity(id: number, data: Partial<RestaurantEntity>): Promise<RestaurantEntity> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = $${index++}`);
        values.push(value);
      }
    });

    values.push(id);
    const result = await db.query(
      `UPDATE restaurants SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
      values
    );
    const f = result.rows[0];
    return new RestaurantEntity(f.id, f.owner_user_id, f.name, f.tax_id, f.is_active, f.latitude, f.longitude, f.logo_url);
  }

  /**
   * Gestiona horarios del restaurante
   * US025.4
   */
  static async setHours(hours: RestaurantHours): Promise<void> {
    await db.query(
      `INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE 
       SET open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time`,
      [hours.restaurant_id, hours.day_of_week, hours.open_time, hours.close_time]
    );
  }

  /**
   * Obtiene horarios del restaurante
   */
  static async getHours(restaurantId: number): Promise<RestaurantHours[]> {
    const result = await db.query(
      `SELECT * FROM restaurant_hours WHERE restaurant_id = $1 ORDER BY day_of_week`,
      [restaurantId]
    );
    return result.rows;
  }
}
