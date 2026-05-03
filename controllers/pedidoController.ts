// controllers/pedidoController.ts
import { PedidoDAO } from "../models/daos/PedidoDAO";

export class PedidoController {
  /*
  async crearPedido(
    userId: number,
    restaurantId: number,
    items: { product_id: number; quantity: number }[]
  ) {
    if (!items || items.length === 0) {
      throw new Error("El carrito está vacío");
    }
    return await PedidoDAO.crearPedido(userId, restaurantId, items);
  } */

  // controllers/pedidoController.ts

  async completarPedido(pedidoId: number) {
    const pedido = await PedidoDAO.findActiveOrderById(pedidoId);
    if (!pedido) {
      throw new Error("Pedido no encontrado o ya finalizado");
    }
    // Solo permitir completar si el estado actual es DELIVERED
    if (pedido.status !== 'ON_DELIVERY') {
      if (pedido.status === 'PENDING') {
        throw new Error(`No se puede completar un pedido en estado pendiente. Solo se permite completar pedidos entregados.`);
      }else{
        if (pedido.status === 'CONFIRMED') {
          throw new Error(`No se puede completar un pedido en estado confirmado. Solo se permite completar pedidos entregados.`);
        }else{
          if (pedido.status === 'READY') {
            throw new Error(`No se puede completar un pedido en estado listo. Solo se permite completar pedidos entregados.`);
          }else{
            if (pedido.status === 'CANCELLED') {
              throw new Error(`No se puede completar un pedido cancelado. Solo se permite completar pedidos entregados.`);
            }else{
              throw new Error(`No se puede completar un pedido en estado '${pedido.status}'. Solo se permite completar pedidos entregados.`);
            }
          }
        }
      }
    }
    await PedidoDAO.completarPedido(pedidoId);
  }

  async cancelPedido(pedidoId: number) {
    const pedido = await PedidoDAO.findActiveOrderById(pedidoId);
    if (!pedido) {
      throw new Error("Pedido no encontrado o ya finalizado");
    }
    // Estados en los que se puede cancelar
    if (!["PENDING", "CONFIRMED"].includes(pedido.status)) {
      throw new Error("No se puede cancelar el pedido en este estado");
    }
    await PedidoDAO.cancelPedido(pedidoId);
    return { message: "Pedido cancelado. Queda pendiente de reembolso." };
  }

  async getPedidos(userId: number) {
    return await PedidoDAO.getPedidosByUser(userId);
  }

  async registrarHistorial(
    orderId: number,
    customerId: number,
    restaurantId: number,
    items: { product_id: number; quantity: number }[]
  ) {
    if (!items || items.length === 0) {
      throw new Error("No hay items para registrar en historial");
    }
    return await PedidoDAO.registrarHistorial(orderId, customerId, restaurantId, items);
  }
}