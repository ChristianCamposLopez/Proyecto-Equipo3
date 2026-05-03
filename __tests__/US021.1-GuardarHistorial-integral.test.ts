import { PedidoDAO } from "@/models/daos/PedidoDAO";
import { db } from "@/config/db";
import { PedidoService } from "@/services/PedidoService";
import { POST, GET } from "@/app/api/pedidos/route";
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

// Helper para simular NextRequest con body JSON
const createPostRequest = (body: any) => {
  return {
    json: async () => body,
  } as NextRequest;
};

describe("US021.1: Experiencia del Cliente – Guardar historial de pedidos (Pruebas Integrales)", () => {
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

    describe("registrarHistorial", () => {
      it("✓ debe insertar pedido en historial y sus items con precios actuales", async () => {
        const items = [
          { product_id: 101, quantity: 2 },
          { product_id: 102, quantity: 1 },
        ];
        mockClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 101, base_price: 10 }, { id: 102, base_price: 20 }], rowCount: 2 }) // precios
          .mockResolvedValueOnce({}) // INSERT pedido_historial
          .mockResolvedValueOnce({}) // INSERT item 1
          .mockResolvedValueOnce({}) // INSERT item 2
          .mockResolvedValueOnce({}); // COMMIT

        const result = await PedidoDAO.registrarHistorial(123, 1, 5, items);
        expect(result).toEqual({ success: true });
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringMatching(/BEGIN/i));
        expect(mockClient.query).toHaveBeenCalledWith(
          expect.stringMatching(/INSERT INTO pedido_historial/i),
          [123, 1, 5, expect.any(Number)]
        );
        expect(mockClient.query).toHaveBeenCalledTimes(6);
      });

      it("✗ debe lanzar error si algún producto no existe", async () => {
        const items = [{ product_id: 999, quantity: 1 }];
        mockClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // productos

        await expect(PedidoDAO.registrarHistorial(1, 1, 1, items))
          .rejects.toThrow("Algún producto no existe");
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringMatching(/ROLLBACK/i));
      });

      it("✗ debe hacer rollback si ocurre cualquier error", async () => {
        const items = [{ product_id: 1, quantity: 1 }];
        mockClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 1, base_price: 5 }], rowCount: 1 })
          .mockRejectedValueOnce(new Error("DB insert error"));

        await expect(PedidoDAO.registrarHistorial(1, 1, 1, items))
          .rejects.toThrow("DB insert error");
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringMatching(/ROLLBACK/i));
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Service + API Routes)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    // Espías para interceptar los métodos del DAO sin mockear todo el módulo
    let spyRegistrarHistorial: jest.SpyInstance;
    let spyGetPedidosByUser: jest.SpyInstance;

    beforeEach(() => {
      spyRegistrarHistorial = jest.spyOn(PedidoDAO, 'registrarHistorial');
      spyGetPedidosByUser = jest.spyOn(PedidoDAO, 'getPedidosByUser');
    });

    afterEach(() => {
      spyRegistrarHistorial.mockRestore();
      spyGetPedidosByUser.mockRestore();
    });

    describe("PedidoService.registrarHistorial", () => {
      it("✓ debe llamar al DAO con los parámetros correctos", async () => {
        spyRegistrarHistorial.mockResolvedValueOnce({ success: true });
        const items = [{ product_id: 1, quantity: 2 }];
        const controller = new PedidoService();
        await controller.registrarHistorial(100, 5, 10, items);
        expect(spyRegistrarHistorial).toHaveBeenCalledWith(100, 5, 10, items);
      });

      it("✗ debe lanzar error si items está vacío", async () => {
        const controller = new PedidoService();
        await expect(controller.registrarHistorial(1, 1, 1, []))
          .rejects.toThrow("No hay items para registrar en historial");
        expect(spyRegistrarHistorial).not.toHaveBeenCalled();
      });
    });

    describe("API POST /api/pedidos", () => {
      it("✓ debe retornar 200 cuando se registra correctamente", async () => {
        spyRegistrarHistorial.mockResolvedValueOnce({ success: true });
        const body = { orderId: 1, customerId: 1, restaurant_id: 2, items: [{ product_id: 1, quantity: 1 }] };
        const req = createPostRequest(body);
        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual({ message: "PedidoEntity registrado en historial", pedidoId: 1 });
      });

      it("✗ debe retornar 400 si faltan campos obligatorios", async () => {
        const req = createPostRequest({ orderId: 1 }); // faltan customerId, restaurant_id, items
        const res = await POST(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toContain("Faltan datos");
      });

    });

    describe("API GET /api/pedidos", () => {
      it("✓ debe retornar lista de pedidos del usuario", async () => {
        const fakePedidos = [{ id: 1, total_amount: 50 }];
        spyGetPedidosByUser.mockResolvedValueOnce(fakePedidos);
        
        // Simulamos el objeto Request con la URL necesaria
        const req = {
          url: "http://localhost/api/pedidos?customerId=123"
        } as Request;

        const res = await GET(req);
        
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual({ pedidos: fakePedidos });
        expect(spyGetPedidosByUser).toHaveBeenCalledWith(123);
      });
    });
  });
});