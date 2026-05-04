/**
 * US024: Gestión de Pedidos – Cancelar pedido
 * Corrección de integración y verificación lógica.
 */

import { PedidoDAO } from "@/models/daos/PedidoDAO";
import { PedidoService } from "@/services/PedidoService";
import { db } from "@/config/db";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { 
    connect: jest.fn(), 
    query: jest.fn() 
  },
}));

const mockConnect = db.connect as jest.Mock;

describe("US024: Cancelación de Pedidos – Verificación de Flujo", () => {
  
  beforeAll(() => {
    console.log(">>> [LOGICA] Verificando US024: Cancelación y Reversión de Stock...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PedidoDAO.cancelPedido (Integración con DB)", () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      mockConnect.mockResolvedValue(mockClient);
    });

    it("✓ DEBE cancelar y restaurar stock (Camino Feliz)", async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ status: 'PENDING' }], rowCount: 1 }) // STATUS
        .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE STATUS
        .mockResolvedValueOnce({ rows: [{ product_id: 1, quantity: 2 }], rowCount: 1 }) // ITEMS
        .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE STOCK
        .mockResolvedValueOnce({ rowCount: 1 }) // DELETE 1
        .mockResolvedValueOnce({ rowCount: 1 }) // DELETE 2
        .mockResolvedValueOnce({}); // COMMIT

      const result = await PedidoDAO.cancelPedido(1);
      expect(result.message).toBe("PedidoEntity cancelado exitosamente");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    });

    it("⚠ DEBE rechazar si el pedido ya fue entregado", async () => {
      console.log("  -> Caso: Pedido DELIVERED no puede cancelarse");
      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ status: 'DELIVERED' }], rowCount: 1 }); // STATUS

      await expect(PedidoDAO.cancelPedido(1))
        .rejects.toThrow("No se puede cancelar en estado DELIVERED");
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });
});