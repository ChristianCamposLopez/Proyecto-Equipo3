// models/daos/CategoriaDAO.ts
/*import { db } from "../../config/db";

export interface Categoria {
  id: number;
  name: string;
  restaurant_id: number;
}

export class CategoriaDAO {
  static async getByRestaurant(restaurantId: number): Promise<Categoria[]> {
    const query = `
      SELECT id, name
      FROM categories
      WHERE restaurant_id = $1
      ORDER BY name ASC
    `;

    const result = await db.query(query, [restaurantId]);
    return result.rows;
  }
} */
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