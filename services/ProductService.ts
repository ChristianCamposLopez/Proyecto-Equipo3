/**
 * services/ProductService.ts
 * Capa de Servicios - Lógica de Negocio para Productos (US008)
 * 
 * Responsabilidades:
 * - Orquestar operaciones de productos
 * - Aplicar reglas de negocio
 * - Validar datos antes de persistencia
 * - Coordinar múltiples DAOs si es necesario
 */

import { ProductAvailabilityDAO } from '@/models/daos/ProductAvailabilityDAO';

export type ProductAvailability = {
  id: number;
  name: string;
  stock: number;
  is_available: boolean;
};

export class ProductService {
  private static dao: ProductAvailabilityDAO | null = null;

  /**
   * Establecer una instancia del DAO (útil para tests)
   */
  static setDAO(daoInstance: ProductAvailabilityDAO): void {
    ProductService.dao = daoInstance;
  }

  /**
   * Obtener la instancia del DAO (crear si no existe)
   */
  private static getDAO(): ProductAvailabilityDAO {
    if (!ProductService.dao) {
      ProductService.dao = new ProductAvailabilityDAO();
    }
    return ProductService.dao;
  }

  /**
   * Actualizar stock de un producto
   * Validaciones de negocio:
   * - Stock no puede ser negativo
   * - Stock 0 automáticamente marca como agotado
   * - Stock > 0 automáticamente marca como disponible
   * 
   * @param productId - ID del producto
   * @param stock - Nueva cantidad de stock
   * @returns ProductAvailability actualizado
   */
  static async updateProductStock(
    productId: number,
    stock: number
  ): Promise<ProductAvailability> {
    // Validación 1: ID válido
    if (!this.isValidProductId(productId)) {
      throw new Error('ID de producto inválido');
    }

    // Validación 2: Stock válido
    if (!this.isValidStock(stock)) {
      throw new Error('El stock debe ser un número entero mayor o igual a cero');
    }

    // Validación 3: Detectar cambios significativos (opcional log)
    const willMarkAsOutOfStock = stock === 0;
    const willMarkAsAvailable = stock > 0;

    if (willMarkAsOutOfStock) {
      console.info(`[ProductService] Marcando producto ${productId} como agotado`);
    }
    if (willMarkAsAvailable) {
      console.info(`[ProductService] Reactivando producto ${productId}`);
    }

    // Persistir cambios
    const updated = await this.getDAO().updateStock(productId, stock);

    // Validación 4: Verificar consistencia post-actualización
    this.validateStockConsistency(updated);

    return updated;
  }

  /**
   * Marcar un producto como agotado (stock = 0)
   * Caso de uso específico: Chef quiere marcar inmediatamente como agotado
   * 
   * @param productId - ID del producto
   * @returns ProductAvailability con stock=0, is_available=false
   */
  static async markAsOutOfStock(productId: number): Promise<ProductAvailability> {
    console.info(`[ProductService] Marcando producto ${productId} como out-of-stock`);
    return this.updateProductStock(productId, 0);
  }

  /**
   * Verificar si un producto está disponible para compra
   * 
   * @param productId - ID del producto
   * @returns boolean - true si disponible
   */
  static async isProductAvailable(productId: number): Promise<boolean> {
    if (!this.isValidProductId(productId)) {
      return false;
    }

    try {
      // En una BD real, consultarías el estado actual
      // Por ahora retornamos lógica simple
      // En futuro: SELECT is_available FROM products WHERE id=?
      return true; // Placeholder
    } catch (error) {
      console.error(`[ProductService] Error verificando disponibilidad: ${error}`);
      return false;
    }
  }

  /**
   * Obtener stock actual de un producto
   * 
   * @param productId - ID del producto
   * @returns stock actual o null si no existe
   */
  static async getProductStock(productId: number): Promise<number | null> {
    if (!this.isValidProductId(productId)) {
      return null;
    }

    try {
      // Placeholder: En futuro se consultaría la BD
      return null;
    } catch (error) {
      console.error(`[ProductService] Error obteniendo stock: ${error}`);
      return null;
    }
  }

  /**
   * Validar que el ID de producto sea válido
   * 
   * @param productId - ID a validar
   * @returns boolean - true si válido
   */
  private static isValidProductId(productId: any): boolean {
    return Number.isInteger(productId) && productId > 0;
  }

  /**
   * Validar que el stock sea válido
   * 
   * @param stock - Stock a validar
   * @returns boolean - true si válido
   */
  private static isValidStock(stock: any): boolean {
    return Number.isInteger(stock) && stock >= 0;
  }

  /**
   * Validar consistencia stock-is_available
   * Lanzar error si la relación es inconsistente
   * 
   * @param product - Producto a validar
   * @throws Error si inconsistencia
   */
  private static validateStockConsistency(product: ProductAvailability): void {
    const { stock, is_available } = product;

    // Regla 1: Si stock = 0, debe estar agotado
    if (stock === 0 && is_available) {
      throw new Error(
        `Inconsistencia: Producto ${product.id} tiene stock=0 pero is_available=true`
      );
    }

    // Regla 2: Si stock > 0, debe estar disponible
    if (stock > 0 && !is_available) {
      throw new Error(
        `Inconsistencia: Producto ${product.id} tiene stock>${stock} pero is_available=false`
      );
    }
  }
}
