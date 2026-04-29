import { PedidoDAO } from "@/models/daos/PedidoDAO";
import { PedidoController } from "@/controllers/pedidoController";
import { db } from "@/config/db";
import { PUT as cancelRoute } from "@/app/api/pedidos/[id]/cancel/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES Y CONFIGURACIÓN
// =========================================================
jest.mock("@/config/db", () => ({
  db: { 
    connect: jest.fn(), 
    query: jest.fn() 
  },
}));

const mockConnect = db.connect as jest.Mock;
const mockQuery = db.query as jest.Mock;

const createReq = () => ({ json: async () => ({}) } as NextRequest);

describe("US024: Gestión de Pedidos – Cancelar pedido (Integral)", () => {
  
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

    describe("PedidoDAO.cancelPedido (Transaccional)", () => {
      it("✓ debe cancelar pedido en historial, revertir stock y eliminar de orders activas", async () => {
        mockClient.query
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [{ status: 'PENDING' }], rowCount: 1 }) // verificar estado
          .mockResolvedValueOnce({}) // UPDATE historial a CANCELLED
          .mockResolvedValueOnce({ rows: [{ product_id: 1, quantity: 2 }] }) // items del pedido
          .mockResolvedValueOnce({}) // UPDATE stock +2
          .mockResolvedValueOnce({}) // DELETE order_items
          .mockResolvedValueOnce({}) // DELETE orders
          .mockResolvedValueOnce({}); // COMMIT

        const result = await PedidoDAO.cancelPedido(123);
        
        expect(result).toEqual({ message: "Pedido cancelado. Stock revertido." });
        expect(mockClient.query).toHaveBeenCalledTimes(8);
        expect(mockClient.query).toHaveBeenCalledWith(
          expect.stringMatching(/UPDATE products SET stock = stock \+ \$1/i), 
          [2, 1]
        );
      });

      it("✗ debe lanzar error si el pedido no está en estado PENDING", async () => {
        mockClient.query
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [{ status: 'COMPLETED' }], rowCount: 1 });

        await expect(PedidoDAO.cancelPedido(1)).rejects.toThrow("No se puede cancelar un pedido en estado 'COMPLETED'");
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringMatching(/ROLLBACK/i));
      });

      it("✗ debe hacer rollback si ocurre cualquier error", async () => {
        mockClient.query
          .mockResolvedValueOnce({}) // BEGIN
          .mockRejectedValueOnce(new Error("DB error"));

        await expect(PedidoDAO.cancelPedido(1)).rejects.toThrow("DB error");
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringMatching(/ROLLBACK/i));
      });
    });

    describe("PedidoDAO.updateHistorialStatus y findActiveOrderById", () => {
      it("✓ debe actualizar estado en historial", async () => {
        await PedidoDAO.updateHistorialStatus(5, 'CANCELLED');
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringMatching(/UPDATE pedido_historial SET status = \$1 WHERE id = \$2/i), 
          ['CANCELLED', 5]
        );
      });

      it("✓ debe buscar orden activa por ID", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'PENDING' }] });
        const order = await PedidoDAO.findActiveOrderById(1);
        expect(order).toEqual({ id: 1, status: 'PENDING' });
      });
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Controller & API)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    let controller: PedidoController;
    
    // Espías para interceptar el DAO
    let spyFindActive: jest.SpyInstance;
    let spyCancelPedido: jest.SpyInstance;

    beforeEach(() => {
      controller = new PedidoController();
      spyFindActive = jest.spyOn(PedidoDAO, 'findActiveOrderById');
      spyCancelPedido = jest.spyOn(PedidoDAO, 'cancelPedido');
    });

    afterEach(() => {
      spyFindActive.mockRestore();
      spyCancelPedido.mockRestore();
    });

    describe("PedidoController.cancelPedido", () => {
      it("✓ debe cancelar si el pedido existe y está en estado válido", async () => {
        spyFindActive.mockResolvedValueOnce({ id: 10, status: 'PENDING' });
        spyCancelPedido.mockResolvedValueOnce({ message: "Cancelado" });
        
        const result = await controller.cancelPedido(10);
        
        expect(result).toEqual({ message: "Pedido cancelado. Queda pendiente de reembolso." });
        expect(spyCancelPedido).toHaveBeenCalledWith(10);
      });

      it("✗ debe lanzar error si el pedido no existe o ya está finalizado", async () => {
        spyFindActive.mockResolvedValueOnce(null);
        await expect(controller.cancelPedido(99)).rejects.toThrow("Pedido no encontrado o ya finalizado");
      });

      it("✗ debe lanzar error si estado no es PENDING o CONFIRMED", async () => {
        spyFindActive.mockResolvedValueOnce({ id: 20, status: 'DELIVERED' });
        await expect(controller.cancelPedido(20)).rejects.toThrow("No se puede cancelar el pedido en este estado");
        expect(spyCancelPedido).not.toHaveBeenCalled();
      });
    });

    describe("API PUT /api/pedidos/[id]/cancel", () => {
      it("✓ debe retornar 200 y mensaje", async () => {
        spyFindActive.mockResolvedValueOnce({ id: 5, status: 'PENDING' });
        spyCancelPedido.mockResolvedValueOnce({});
        
        const req = createReq();
        const params = Promise.resolve({ id: "5" });
        const res = await cancelRoute(req, { params });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ message: "Pedido cancelado. Queda pendiente de reembolso." });
      });

      it("✗ debe retornar 400 si ID inválido", async () => {
        const req = createReq();
        const params = Promise.resolve({ id: "abc" });
        const res = await cancelRoute(req, { params });
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.error).toContain("Invalid order id");
      });
    });
  });
});