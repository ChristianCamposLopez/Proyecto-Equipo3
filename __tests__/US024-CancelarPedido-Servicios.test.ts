import { PedidoDAO } from "@/models/daos/PedidoDAO";
import { PedidoService } from "@/services/PedidoService";
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

    describe("PedidoDAO.cancelPedidoEntity (Transaccional)", () => {
      it("✓ debe cancelar pedido en historial, revertir stock y eliminar de orders activas", async () => {
        const pedidoId = 123;
        const itemSimulado = { product_id: 1, quantity: 2 };

        // Definimos el comportamiento de cada llamada en orden:
        mockClient.query
          .mockResolvedValueOnce({}) // 1. BEGIN
          .mockResolvedValueOnce({ 
            rows: [{ status: 'PENDING' }], 
            rowCount: 1 
          }) // 2. SELECT status FROM pedido_historial
          .mockResolvedValueOnce({}) // 3. UPDATE pedido_historial SET status = 'CANCELLED'
          .mockResolvedValueOnce({ 
            rows: [itemSimulado], 
            rowCount: 1 
          }) // 4. SELECT product_id, quantity FROM pedido_items_historial
          .mockResolvedValueOnce({}) // 5. UPDATE products SET stock = stock + $1, is_available = TRUE
          .mockResolvedValueOnce({}) // 6. DELETE FROM order_items
          .mockResolvedValueOnce({}) // 7. DELETE FROM orders
          .mockResolvedValueOnce({}); // 8. COMMIT

        const result = await PedidoDAO.cancelPedidoEntity(pedidoId);

        // Verificaciones
        expect(result).toEqual({ message: "PedidoEntity cancelado. Stock revertido." });
        expect(mockClient.query).toHaveBeenCalledTimes(8);

        // Validar que se actualizó el stock correctamente
        expect(mockClient.query).toHaveBeenCalledWith(
          expect.stringMatching(/UPDATE\s+products\s+SET\s+stock\s*=\s*stock\s*\+\s*\$1/i),
          [itemSimulado.quantity, itemSimulado.product_id]
        );

        // Validar que se usó el ID correcto para el historial
        expect(mockClient.query).toHaveBeenCalledWith(
          expect.stringMatching(/SELECT\s+status\s+FROM\s+pedido_historial/i),
          [pedidoId]
        );
        
        // Validar el COMMIT final
        expect(mockClient.query).toHaveBeenLastCalledWith("COMMIT");
      });

      it("✗ debe lanzar error si el pedido no está en estado PENDING", async () => {
        mockClient.query
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [{ status: 'COMPLETED' }], rowCount: 1 });

        await expect(PedidoDAO.cancelPedidoEntity(1)).rejects.toThrow("No se puede cancelar un pedido en estado 'COMPLETED'");
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringMatching(/ROLLBACK/i));
      });

      it("✗ debe hacer rollback si ocurre cualquier error", async () => {
        mockClient.query
          .mockResolvedValueOnce({}) // BEGIN
          .mockRejectedValueOnce(new Error("DB error"));

        await expect(PedidoDAO.cancelPedidoEntity(1)).rejects.toThrow("DB error");
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
  // 2. CAPA DE SERVICIOS E INTEGRACIÓN (Service & API)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    let controller: PedidoService;
    
    // Espías para interceptar el DAO
    let spyFindActive: jest.SpyInstance;
    let spyCancelPedidoEntity: jest.SpyInstance;

    beforeEach(() => {
      controller = new PedidoService();
      spyFindActive = jest.spyOn(PedidoDAO, 'findActiveOrderById');
      spyCancelPedidoEntity = jest.spyOn(PedidoDAO, 'cancelPedidoEntity');
    });

    afterEach(() => {
      spyFindActive.mockRestore();
      spyCancelPedidoEntity.mockRestore();
    });

    describe("PedidoService.cancelPedidoEntity", () => {
      it("✓ debe cancelar si el pedido existe y está en estado válido", async () => {
        spyFindActive.mockResolvedValueOnce({ id: 10, status: 'PENDING' });
        spyCancelPedidoEntity.mockResolvedValueOnce({ message: "Cancelado" });
        
        const result = await controller.cancelPedidoEntity(10);
        
        expect(result).toEqual({ message: "PedidoEntity cancelado. Queda pendiente de reembolso." });
        expect(spyCancelPedidoEntity).toHaveBeenCalledWith(10);
      });

      it("✗ debe lanzar error si el pedido no existe o ya está finalizado", async () => {
        spyFindActive.mockResolvedValueOnce(null);
        await expect(controller.cancelPedidoEntity(99)).rejects.toThrow("PedidoEntity no encontrado o ya finalizado");
      });

      it("✗ debe lanzar error si estado no es PENDING o CONFIRMED", async () => {
        spyFindActive.mockResolvedValueOnce({ id: 20, status: 'DELIVERED' });
        await expect(controller.cancelPedidoEntity(20)).rejects.toThrow("No se puede cancelar el pedido en este estado");
        expect(spyCancelPedidoEntity).not.toHaveBeenCalled();
      });
    });

    describe("API PUT /api/pedidos/[id]/cancel", () => {
      it("✓ debe retornar 200 y mensaje", async () => {
        spyFindActive.mockResolvedValueOnce({ id: 5, status: 'PENDING' });
        spyCancelPedidoEntity.mockResolvedValueOnce({});
        
        const req = createReq();
        const params = Promise.resolve({ id: "5" });
        const res = await cancelRoute(req, { params });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({ message: "PedidoEntity cancelado. Queda pendiente de reembolso." });
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