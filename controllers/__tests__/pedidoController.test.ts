// controllers/__tests__/pedidoController.test.ts
import { PedidoController } from "../pedidoController";
import { PedidoDAO } from "../../models/daos/PedidoDAO";

jest.mock("../../models/daos/PedidoDAO");

describe("PedidoController - Capa de Servicio", () => {
  test("Debe completar el pedido correctamente para actualizar el historial", async () => {
    console.log("\n--- [SERVICIO] Iniciando completado de pedido ---");
    const controller = new PedidoController();
    const pedidoId = 500;

    console.log(`-> Ordenando al servicio completar pedido ID: ${pedidoId}`);
    await controller.completarPedido(pedidoId);

    console.log("-> Verificando comunicación con la capa de datos (DAO)...");
    expect(PedidoDAO.completarPedido).toHaveBeenCalledWith(pedidoId);
    console.log("--- [ÉXITO] El servicio delegó la tarea correctamente ---\n");
  });
});