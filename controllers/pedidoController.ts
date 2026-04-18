import { PedidoDAO } from "../models/daos/PedidoDAO";

export class PedidoController {

  async crearPedido(
    userId: number,
    restaurantId: number,
    items: { product_id: number; quantity: number }[]
  ) {
    if (!items || items.length === 0) {
      throw new Error("El carrito está vacío");
    }
    return await PedidoDAO.crearPedido(userId, restaurantId, items);
  }

  async completarPedido(pedidoId: number) {
    const pedido = await PedidoDAO.findActiveOrderById(pedidoId);
    if (!pedido) {
      throw new Error("Pedido no encontrado o ya finalizado");
    }
    await PedidoDAO.completarPedido(pedidoId);
  }

  async cancelPedido(pedidoId: number) {
    const pedido = await PedidoDAO.findActiveOrderById(pedidoId);
    if (!pedido) {
      throw new Error("Pedido no encontrado o ya finalizado");
    }
    // Estados en los que NO se puede cancelar
    if (["PREPARING", "READY"].includes(pedido.status)) {
      throw new Error("No se puede cancelar el pedido en este estado");
    }
    await PedidoDAO.cancelPedido(pedidoId);
    return { message: "Pedido cancelado. Queda pendiente de reembolso." };
  }

  async getPedidos(userId: number) {
    return await PedidoDAO.getPedidosByUser(userId);
  }
}