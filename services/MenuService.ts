// services/MenuService.ts
import { ProductoDAO } from "../models/daos/ProductoDAO";

export class MenuService {
  // Eliminar producto (lógico)
  async eliminarProductoEntity(id: number): Promise<void> {
    const product = await ProductoDAO.findByIdIncludingInactive(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    const deleted = await ProductoDAO.logicalDelete(id);
    if (!deleted) {
      throw new Error('No se pudo eliminar el producto');
    }
  }

  // Desactivar producto
  async deactivateProductoEntity(id: number): Promise<void> {
    const product = await ProductoDAO.findByIdIncludingInactive(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    const updated = await ProductoDAO.updateActiveStatus(id, false);
    if (!updated) {
      throw new Error('No se pudo desactivar el producto');
    }
  }

  // Activar producto
  async activateProductoEntity(id: number): Promise<void> {
    const product = await ProductoDAO.findByIdIncludingInactive(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    await ProductoDAO.updateActiveStatus(id, true);
  }

  // Actualizar precio
  async updatePrice(id: number, price: number): Promise<void> {
    if (price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
    const product = await ProductoDAO.findByIdIncludingInactive(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    await ProductoDAO.updatePrice(id, price);
  }

  // Actualizar stock
  async updateStock(id: number, quantity: number): Promise<void> {
    if (quantity < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    const product = await ProductoDAO.findByIdIncludingInactive(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    await ProductoDAO.updateStock(id, quantity);
  }

  // Validaciones auxiliares (podrían ser métodos estáticos o privados)
  validatePrice(price: number): boolean {
    return price > 0;
  }

  validateStock(quantity: number): boolean {
    return quantity >= 0;
  }

  // Crear producto
  async createProductoEntity(data: {
    name: string;
    base_price: number;
    stock: number;
    category_id: number;
    descripcion?: string | null;
  }): Promise<any> {
    if (data.base_price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
    if (data.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    // Validar nombre duplicado (activo o no eliminado)
    const existing = await ProductoDAO.findByName(data.name);
    if (existing && existing.deleted_at === null) {
      throw new Error('Ya existe un plato activo o no eliminado con ese nombre');
    }
    const product = await ProductoDAO.createProductoEntity(data);
    return product;
  }

  // Actualizar nombre/descripción
  async updateProductoEntity(id: number, data: { name?: string; descripcion?: string }): Promise<any> {
    const product = await ProductoDAO.findByIdIncludingInactive(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    // Validar nombre si viene
    if (data.name) {
      const existing = await ProductoDAO.findByName(data.name);
      if (existing && existing.id !== id && existing.deleted_at === null) {
        throw new Error('Ya existe un plato con ese nombre');
      }
    }
    return await ProductoDAO.updateProductoEntity(id, data);
  }

  // Obtener productos para el catálogo (GET /api/platos)
   async getCatalogProducts(
      restaurantId: number | null,
      includeInactive: boolean = false,
      categoryId: number | null = null // NUEVO Para filtaredo de categorias USOO1 (Sprint 6)
    ) {
      const products = await ProductoDAO.getProductsByRestaurant(
        restaurantId,
        includeInactive,
        categoryId
      );

      return { products };
    }

   async getProductById(id: number) {
    const product = await ProductoDAO.getProductById(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
  }

  async updateNombre(id: number, name: string) {
    if (!name) throw new Error('El nombre es requerido');
    // Validar duplicado
    const existing = await ProductoDAO.findByName(name);
    if (existing && existing.id !== id && existing.deleted_at === null) {
      throw new Error('Ya existe un plato con ese nombre');
    }
    const updated = await ProductoDAO.updateProductoEntity(id, { name });
    return updated;
  }

  async updateDescripcion(id: number, descripcion: string | null) {
    const updated = await ProductoDAO.updateProductoEntity(id, { descripcion: descripcion ?? undefined });
    return updated;
  }

  async searchCatalog(term: string, restaurantId?: number) {
    if (!term || term.trim().length === 0) {
      throw new Error("Término de búsqueda inválido");
    }
    if (term.trim().length < 2) {
      throw new Error("Término de búsqueda demasiado corto");
    }
    const products = await ProductoDAO.searchProducts(term.trim(), restaurantId);
    return { products };
  }
}