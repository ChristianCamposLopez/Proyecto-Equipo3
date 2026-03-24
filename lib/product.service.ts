//lib/product.service.ts
import { ProductRepository } from './repositories/product.repository';

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  async eliminarProduct(id: number): Promise<void> {

    const product = await this.repository.findById_2(id);

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const deleted = await this.repository.logicalDelete(id);

    if (!deleted) {
      throw new Error('No se pudo eliminar el producto');
    }

  }

  async deactivateProduct(id: number): Promise<void> {
    const product = await this.repository.findById_2(id);

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const updated = await this.repository.updateActiveStatus(id, false);

    if (!updated) {
      throw new Error('No se pudo desactivar el producto');
    }
  }

  async activateProduct(id: number): Promise<void> {

    const product = await this.repository.findById_2(id);

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    await this.repository.updateActiveStatus(id, true);

  }

  async updatePrice(id: number, price: number): Promise<void> {

    if (price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    const product = await this.repository.findById_2(id);

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    await this.repository.updatePrice(id, price);

  }

  async updateStock(id: number, quantity: number): Promise<void> {

    if (quantity < 0) {
      throw new Error('El stock no puede ser negativo');
    }

    const product = await this.repository.findById_2(id);

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    await this.repository.updateStock(id, quantity);

  }

  validatePrice(price: number): boolean {
    return price > 0;
  }

  validateStock(quantity: number): boolean {
    return quantity >= 0;
  }

  async createProduct(data: {
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

    // Validar nombre duplicado
    const existing = await this.repository.findByName(data.name);

    if (existing && existing.deleted_at === null) {
      throw new Error('Ya existe un plato activo o no eliminado con ese nombre');
    }

    const product = await this.repository.createProduct(data);

    return product;
  }
  
  async updateProduct(
    id: number,
    data: { name?: string; descripcion?: string }
  ) {
    const product = await this.repository.findById_2(id);

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // VALIDAR nombre si viene
    if (data.name) {
      const existing = await this.repository.findByName(data.name);

      if (existing && existing.id !== id && existing.deleted_at === null) {
        throw new Error('Ya existe un plato con ese nombre');
      }
    }

    return await this.repository.updateProduct(id, data);
  }
}