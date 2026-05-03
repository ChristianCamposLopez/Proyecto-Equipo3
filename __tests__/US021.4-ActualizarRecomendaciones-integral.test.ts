import { PedidoDAO } from "@/models/daos/PedidoDAO";
import { RecomendacionDAO } from "@/models/daos/RecomendacionDAO";
import { db } from "@/config/db";
import { PedidoController } from "@/controllers/pedidoController";
import { RecomendacionController } from "@/controllers/RecomendacionController";
import { POST as registrarPedido } from "@/app/api/pedidos/route";
import { GET as obtenerRecomendaciones } from "@/app/api/recommendations/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES (solo la base de datos)
// =========================================================
jest.mock("@/config/db", () => ({
  db: { connect: jest.fn(), query: jest.fn() },
}));

const mockDb = db as jest.Mocked<typeof db>;
const mockConnect = mockDb.connect as jest.Mock;
const mockQuery = mockDb.query as jest.Mock;

// Helpers
const createPostRequest = (body: any) => ({ json: async () => body } as NextRequest);
const createGetRequest = (url: string) => ({ url } as NextRequest);

describe("US021.4: Experiencia del Cliente – Actualizar recomendaciones (Pruebas Integrales)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (PedidoDAO y RecomendacionDAO)
  // =========================================================
  describe("Capa de Persistencia", () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = { query: jest.fn(), release: jest.fn() };
      mockConnect.mockResolvedValue(mockClient);
    });

    describe("PedidoDAO.registrarHistorial", () => {
      it("✓ debe insertar pedido y sus items (transacción)", async () => {
        const items = [{ product_id: 101, quantity: 2 }];
        mockClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 101, base_price: 10 }], rowCount: 1 }) // precios
          .mockResolvedValueOnce({}) // INSERT pedido_historial
          .mockResolvedValueOnce({}) // INSERT item
          .mockResolvedValueOnce({}); // COMMIT

        const result = await PedidoDAO.registrarHistorial(123, 1, 5, items);
        expect(result).toEqual({ success: true });
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringMatching(/BEGIN/i));
        expect(mockClient.query).toHaveBeenCalledTimes(5);
      });

      it("✗ debe hacer rollback si falla algún paso", async () => {
        const items = [{ product_id: 1, quantity: 1 }];
        mockClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockRejectedValueOnce(new Error("DB insert error"));

        await expect(PedidoDAO.registrarHistorial(1, 1, 1, items)).rejects.toThrow("DB insert error");
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringMatching(/ROLLBACK/i));
      });
    });

    describe("RecomendacionDAO.getTopRecommendations", () => {
      it("✓ debe consultar productos más vendidos para un usuario y restaurante", async () => {
        const fakeRows = [{ id: 1, name: "Nuevo producto", score: 5 }];
        mockQuery.mockResolvedValueOnce({ rows: fakeRows });
        const result = await RecomendacionDAO.getTopRecommendations(1, 5);
        expect(result).toEqual(fakeRows);
        expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("SUM(oi.quantity)"), [1, 5]);
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Flujo completo)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    let spyRegistrarHistorial: jest.SpyInstance;
    let spyGetTop: jest.SpyInstance;

    beforeEach(() => {
      spyRegistrarHistorial = jest.spyOn(PedidoDAO, 'registrarHistorial');
      spyGetTop = jest.spyOn(RecomendacionDAO, 'getTopRecommendations');
    });

    afterEach(() => {
      spyRegistrarHistorial.mockRestore();
      spyGetTop.mockRestore();
    });

    it("✓ luego de registrar un pedido, el sistema puede recalcular recomendaciones actualizadas", async () => {
      // 1. Simular registro de pedido exitoso
      spyRegistrarHistorial.mockResolvedValueOnce({ success: true });

      const pedidoBody = {
        orderId: 100,
        customerId: 1,
        restaurant_id: 2,
        items: [{ product_id: 5, quantity: 1 }],
      };
      const reqPost = createPostRequest(pedidoBody);
      const resPost = await registrarPedido(reqPost);
      expect(resPost.status).toBe(200);
      expect(spyRegistrarHistorial).toHaveBeenCalledWith(100, 1, 2, pedidoBody.items);

      // 2. Después de guardar, simulamos que las recomendaciones ahora incluyen un nuevo plato
      const nuevasRecomendaciones = [{ id: 99, name: "Nuevo producto recomendado", base_price: 15, image_display: "/new.jpg" }];
      spyGetTop.mockResolvedValueOnce(nuevasRecomendaciones);

      // 3. Obtener recomendaciones (simulando que se recalcularon después del pedido)
      const reqGet = createGetRequest("http://localhost/api/recommendations?restaurantId=2&customerId=1");
      const resGet = await obtenerRecomendaciones(reqGet);
      const json = await resGet.json();

      expect(resGet.status).toBe(200);
      expect(json.recommendations).toEqual(nuevasRecomendaciones);
      expect(spyGetTop).toHaveBeenCalledWith(1, 2); // customerId=1, restaurantId=2
    });

    it("✗ si el registro del pedido falla, no se deben actualizar las recomendaciones (no se vuelve a consultar)", async () => {
      spyRegistrarHistorial.mockRejectedValueOnce(new Error("Error al guardar"));

      const pedidoBody = {
        orderId: 100,
        customerId: 1,
        restaurant_id: 2,
        items: [{ product_id: 5, quantity: 1 }],
      };
      const reqPost = createPostRequest(pedidoBody);
      const resPost = await registrarPedido(reqPost);
      expect(resPost.status).toBe(500); // o 400 según la implementación
      expect(spyGetTop).not.toHaveBeenCalled(); // No se intentó obtener nuevas recos porque falló el guardado
    });
  });
});