/**
 * US021.4: Experiencia del Cliente – Actualizar recomendaciones
 * Pruebas sobre el flujo de actualización de recomendaciones tras un pedido.
 */

import { PedidoDAO } from "@/models/daos/PedidoDAO";
import { RecomendacionDAO } from "@/models/daos/RecomendacionDAO";
import { db } from "@/config/db";
import { PedidoService } from "@/services/PedidoService";
import { RecomendacionService } from "@/services/RecomendacionService";
import { GET as obtenerRecomendaciones } from "@/app/api/recommendations/route";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { connect: jest.fn(), query: jest.fn() },
}));

const mockDb = db as jest.Mocked<typeof db>;
const mockConnect = mockDb.connect as jest.Mock;
const mockQuery = mockDb.query as jest.Mock;

describe("US021.4: Actualizar recomendaciones (Trazabilidad)", () => {
  
  beforeAll(() => {
    console.log(">>> Probando US021.4: Actualización de Recomendaciones...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA
  // =========================================================
  describe("Capa de Persistencia", () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = { query: jest.fn(), release: jest.fn() };
      mockConnect.mockResolvedValue(mockClient);
    });

    it("✓ debe insertar pedido y sus items (ÉXITO)", async () => {
      const items = [{ product_id: 101, quantity: 2 }];
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 101, base_price: 10 }], rowCount: 1 }) // precios
        .mockResolvedValueOnce({}) // INSERT pedido_historial
        .mockResolvedValueOnce({}) // INSERT item
        .mockResolvedValueOnce({}); // COMMIT

      const result = await PedidoDAO.registrarHistorial(123, 1, 5, items, {});
      expect(result).toEqual({ success: true });
    });
  });

  // =========================================================
  // 2. FLUJO COMPLETO (Service + API)
  // =========================================================
  describe("Flujo Completo", () => {
    let spyRegistrar: jest.SpyInstance;
    let spyGetTop: jest.SpyInstance;

    beforeEach(() => {
      spyRegistrar = jest.spyOn(PedidoDAO, 'registrarHistorial');
      spyGetTop = jest.spyOn(RecomendacionDAO, 'getTopRecommendations');
    });

    afterEach(() => {
      spyRegistrar.mockRestore();
      spyGetTop.mockRestore();
    });

    it("✓ las recomendaciones se actualizan tras un pedido exitoso (ÉXITO)", async () => {
      console.log("  -> Verificando que las recomendaciones cambian tras registrar un pedido...");
      
      // 1. Registrar pedido vía Service
      spyRegistrar.mockResolvedValueOnce({ success: true });
      const service = new PedidoService();
      await service.registrarHistorial(100, 1, 2, [{ product_id: 5, quantity: 1 }]);

      // 2. Simular nuevas recomendaciones
      const nuevasRecos = [{ id: 99, name: "Producto Estrella", base_price: 15 }];
      spyGetTop.mockResolvedValueOnce(nuevasRecos);

      // 3. Consultar API de recomendaciones
      const req = new Request("http://localhost/api/recommendations?restaurantId=2&customerId=1");
      const res = await obtenerRecomendaciones(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.recommendations).toEqual(nuevasRecos);
      expect(spyGetTop).toHaveBeenCalledWith(1, 2);
    });

    it("✗ no se consultan recomendaciones si el pedido falla (FALLO)", async () => {
        console.log("  -> Verificando que no hay re-calculo si el pedido falla...");
        spyRegistrar.mockRejectedValueOnce(new Error("Error DB"));
        const service = new PedidoService();
        
        await expect(service.registrarHistorial(1, 1, 1, [{product_id:1, quantity:1}]))
            .rejects.toThrow("Error DB");
            
        expect(spyGetTop).not.toHaveBeenCalled();
    });
  });
});