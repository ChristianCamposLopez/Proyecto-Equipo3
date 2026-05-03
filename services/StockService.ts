// services/StockService.ts
import { StockDAO } from '@/models/daos/StockDAO';

export class StockService {
  async updateProductStock(productId: number, quantity: number, reason?: string) {
    return await StockDAO.updateStock(productId, quantity, reason);
  }

  async addProductStock(productId: number, quantity: number) {
    return await StockDAO.addStock(productId, quantity);
  }

  async decreaseProductStock(productId: number, quantity: number) {
    return await StockDAO.decreaseStock(productId, quantity);
  }

  async markOutOfStock(productId: number) {
    return await StockDAO.markOutOfStock(productId);
  }

  async restoreProductAvailability(productId: number, initialStock: number = 10) {
    return await StockDAO.markAvailable(productId, initialStock);
  }

  async getStockAlerts(restaurantId: number) {
    return await StockDAO.getLowStockAlerts(restaurantId);
  }

  async getStockSummary(restaurantId: number) {
    return await StockDAO.getStockSummary(restaurantId);
  }
}
