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

    const result = await PedidoDAO.crearPedido(
      userId,
      restaurantId,
      items
    );

    return result;
  }

  async completarPedido(pedidoId: number) {
    await PedidoDAO.completarPedido(pedidoId);
  }

  async getPedidos(userId: number) {
    return await PedidoDAO.getPedidosByUser(userId);
  }
}