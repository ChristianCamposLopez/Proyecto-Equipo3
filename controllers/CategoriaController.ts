// controllers/CategoriaController.ts
import { CategoriaDAO } from "../models/daos/CategoriaDAO";

export class CategoriaController {
  async getCategoriesByRestaurant(restaurantId: number) {
    if (!restaurantId) {
      throw new Error("restaurantId es requerido");
    }

    const categories = await CategoriaDAO.getByRestaurant(restaurantId);

    return { categories };
  }
}