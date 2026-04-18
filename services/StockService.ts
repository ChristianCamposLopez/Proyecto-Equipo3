// services/StockService.ts
// Capa de servicio — US008: Control de Stock (Plato Agotado)

import { StockDAO } from '@/models/daos/StockDAO';

/**
 * StockService — Lógica de negocio para disponibilidad de productos.
 * US008: El chef marca un plato como "agotado", bloqueando su pedido.
 */
export class StockService {
  private stockDAO: StockDAO;

  constructor() {
    this.stockDAO = new StockDAO();
  }

  /**
   * US008: Cambia la disponibilidad de un producto.
   */
  async toggleAvailability(productId: number, isAvailable: boolean): Promise<void> {
    return this.stockDAO.toggleAvailability(productId, isAvailable);
  }

  /**
   * Obtiene todos los productos con su estado.
   */
  async getAllProductsWithStatus() {
    return this.stockDAO.getAllProductsWithStatus();
  }

  /**
   * Obtiene el estado de un producto específico.
   */
  async getProductStatus(productId: number) {
    return this.stockDAO.getProductStatus(productId);
  }
}
