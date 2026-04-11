// models/daos/__tests__/PedidoDAO.test.ts
import { PedidoDAO } from "../PedidoDAO";
import { db } from "../../../config/db";

jest.mock("../../../config/db", () => ({
  db: {
    connect: jest.fn(),
    query: jest.fn(),
  },
}));

describe("PedidoDAO - Capa de Persistencia", () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (db.connect as jest.Mock).mockResolvedValue(mockClient);
    jest.clearAllMocks();
  });

  test("crearPedido debe ejecutar transacciones y devolver el pedidoId", async () => {
    console.log("\n--- [PASO 1] Iniciando prueba: Crear Pedido Exitoso ---");
    const items = [{ product_id: 1, quantity: 2 }];
    
    console.log("-> Configurando mocks para el flujo: BEGIN -> SELECT -> INSERT -> COMMIT");
    mockClient.query.mockResolvedValueOnce({}); // BEGIN
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1, base_price: "10.00" }] }); // Precios
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 500 }] }); // Pedido ID
    mockClient.query.mockResolvedValueOnce({}); // Items
    mockClient.query.mockResolvedValueOnce({}); // COMMIT

    console.log("-> Ejecutando PedidoDAO.crearPedido...");
    const result = await PedidoDAO.crearPedido(1, 10, items);

    console.log(`-> Validando resultado: Se esperaba ID 500, se obtuvo ${result.pedidoId}`);
    expect(result.pedidoId).toBe(500);
    console.log("-> Verificando que se llamó a COMMIT para persistir datos.");
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    console.log("--- [ÉXITO] Prueba finalizada correctamente ---\n");
  });

  test("Debe hacer ROLLBACK si falla la inserción del pedido", async () => {
    console.log("\n--- [PASO 2] Iniciando prueba: Fallo y Seguridad de Datos (Rollback) ---");
    const items = [{ product_id: 1, quantity: 2 }];

    mockClient.query.mockResolvedValueOnce({}); // BEGIN
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1, base_price: "10" }] }); // Precios
    mockClient.query.mockRejectedValueOnce(new Error("Error Simulado de DB"));

    console.log("-> Intentando crear pedido con fallo provocado en INSERT...");
    try {
      await PedidoDAO.crearPedido(1, 10, items);
    } catch (error: any) {
      console.log(`-> Error capturado correctamente: ${error.message}`);
    }

    console.log("-> Verificando que se ejecutó ROLLBACK para no dejar basura en la DB.");
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    console.log("--- [ÉXITO] Integridad de datos validada ---\n");
  });
});