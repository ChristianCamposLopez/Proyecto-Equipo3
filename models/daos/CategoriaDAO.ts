// models/daos/CategoriaDAO.ts
/**
 * Capa de Persistencia para Categorías
 * US001: Filtrado de platos por categorías
 */
import { db } from "@/config/db";
import { CategoriaEntity } from "../entities/CategoriaEntity";


export class CategoriaDAO {

  static async getByRestaurant(
    restaurantId: number
  ): Promise<CategoriaEntity[]> {

    const query = `
      SELECT id, name, restaurant_id
      FROM categories
      WHERE restaurant_id = $1
      ORDER BY name ASC
    `;

    const result = await db.query(query, [restaurantId]);
    return result.rows;
  }
}