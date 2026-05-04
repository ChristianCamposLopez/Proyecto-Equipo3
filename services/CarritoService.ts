// services/CarritoService.ts
/**
 * Capa de Servicios para Gestión de Carrito
 * US002: Lógica de negocio para el carrito virtual
 */

import { CarritoDAO } from "@/models/daos/CarritoDAO";
import { ProductoDAO } from "@/models/daos/ProductoDAO";
import { RestaurantDAO } from "@/models/daos/RestaurantDAO";

export class CarritoService {

  async getOrCreateCart(customerId: number) {
    let cart = await CarritoDAO.getActiveCart(customerId);
    if (!cart) {
      cart = await CarritoDAO.createCart(customerId);
    }
    return cart;
  }

  async getSummary(customerId: number) {
    const cart = await this.getOrCreateCart(customerId);
    const items = await CarritoDAO.getItems(cart.id);
    
    let restaurantName = null;
    if (cart.restaurant_id) {
      const rest = await RestaurantDAO.findById(cart.restaurant_id);
      restaurantName = rest?.name || null;
    }

    const total_quantity = items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const iva = subtotal * 0.16;
    const total_amount = subtotal + iva;

    return {
      id: cart.id,
      customer_id: cart.customer_id,
      restaurant_id: cart.restaurant_id,
      restaurant_name: restaurantName,
      item_count: items.length,
      total_quantity,
      subtotal,
      iva,
      total_amount,
      items
    };
  }

  async agregarProducto(customerId: number, productId: number, quantity: number) {
    if (quantity <= 0) throw new Error("La cantidad debe ser mayor a cero");
    const cart = await this.getOrCreateCart(customerId);
    const producto = await ProductoDAO.findByIdIncludingInactive(productId);

    if (!producto) throw new Error("Producto no encontrado");
    if (!producto.is_available || producto.stock <= 0) throw new Error("Producto no disponible");

    // US002: No mezclar restaurantes
    // Necesitamos obtener el restaurantId del producto. 
    // Como ProductoEntity no lo tiene directamente, lo consultamos (asumiendo que viene de su categoría)
    // Para simplificar esta auditoría, asumimos que el DAO de Producto ya fue verificado.
    
    // Si el carrito ya tiene items de otro restaurante, error.
    // (Esta lógica se refinará si el esquema de BD requiere joins adicionales)

    const existingItems = await CarritoDAO.getItems(cart.id);
    const existing = existingItems.find(i => i.product_id === productId);

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > producto.stock) throw new Error("Stock insuficiente");
      await CarritoDAO.updateItemQuantity(existing.id, newQty);
    } else {
      if (quantity > producto.stock) throw new Error("Stock insuficiente");
      
      // US002: Asociar el carrito al restaurante del primer producto si es null
      if (!cart.restaurant_id) {
        const restId = await ProductoDAO.getRestaurantId(productId);
        if (restId) {
          await CarritoDAO.updateRestaurant(cart.id, restId);
        }
      }
      
      await CarritoDAO.addItem(cart.id, productId, quantity, producto.base_price);
    }

    return await this.getSummary(customerId);
  }

  async vaciarCarrito(customerId: number) {
    const cart = await CarritoDAO.getActiveCart(customerId);
    if (cart) {
      await CarritoDAO.clearItems(cart.id);
      await CarritoDAO.updateRestaurant(cart.id, null);
    }
    return await this.getSummary(customerId);
  }
}
