/**
 * US021.1: Experiencia del Cliente – Guardar historial de pedidos
 * Pruebas sobre la persistencia y servicio de historial.
 */

import { PedidoDAO } from "@/models/daos/PedidoDAO";
import { PedidoService } from "@/services/PedidoService";
import { db } from "@/config/db";
import { GET } from "@/app/api/pedidos/route";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { connect: jest.fn(), query: jest.fn() },
}));

const mockDb = db as jest.Mocked<typeof db>;
const mockConnect = mockDb.connect as jest.Mock;

describe("US021.1: Guardar historial de pedidos (Trazabilidad)", () => {
  
  beforeAll(() => {
    console.log(">>> Probando US021: Guardar historial de pedidos...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (PedidoDAO)
  // =========================================================
  describe("Capa de Persistencia (PedidoDAO)", () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      mockConnect.mockResolvedValue(mockClient);
    });

    it("✓ debe insertar pedido en historial con dirección (US027)", async () => {
      console.log("  -> Verificando inserción en pedido_historial con datos reales...");
      const items = [{ product_id: 101, quantity: 2 }];
      const address = { street: "Av. Reforma 100" };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 101, base_price: 150 }], rowCount: 1 }) // precios
        .mockResolvedValueOnce({}) // INSERT pedido_historial
        .mockResolvedValueOnce({}) // INSERT item
        .mockResolvedValueOnce({}); // COMMIT

      const result = await PedidoDAO.registrarHistorial(123, 1, 5, items, address);
      
      expect(result.success).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO pedido_historial/i),
        expect.arrayContaining([123, 1, 5, 300, address])
      );
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS (PedidoService)
  // =========================================================
  describe("Capa de Servicio (PedidoService)", () => {
    it("✓ debe delegar al DAO pasando objeto de dirección vacío si no se provee", async () => {
      const spy = jest.spyOn(PedidoDAO, 'registrarHistorial').mockResolvedValue({ success: true });
      const service = new PedidoService();
      const items = [{ product_id: 1, quantity: 1 }];

      await service.registrarHistorial(1, 1, 1, items);

      // Verificamos que se llame con 5 argumentos (orderId, customerId, restaurantId, items, addressJson)
      expect(spy).toHaveBeenCalledWith(1, 1, 1, items, {});
      spy.mockRestore();
    });
  });

  // =========================================================
  // 3. CAPA API (NextResponse)
  // =========================================================
  describe("API Route (GET /api/pedidos)", () => {
    it("✓ debe retornar historial de pedidos para el cliente (US027)", async () => {
      const fakePedidos = [{ id: 123, total_amount: 300 }];
      jest.spyOn(PedidoDAO, 'getPedidosByUser').mockResolvedValue(fakePedidos);

      const req = new Request("http://localhost/api/pedidos?customerId=1");
      const res = await GET(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.pedidos).toEqual(fakePedidos);
    });
  });
});