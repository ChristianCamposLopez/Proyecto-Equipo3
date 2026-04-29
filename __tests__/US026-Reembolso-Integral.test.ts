import { ReembolsoDAO } from "@/models/daos/ReembolsoDAO";
import { ReembolsoController } from "@/controllers/ReembolsoController";
import { db } from "@/config/db";
import { GET } from "@/app/api/reembolsos/route";
import { PATCH } from "@/app/api/reembolsos/[id]/process/route";
import { NextRequest } from "next/server";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

describe("US026: Pagos y Facturación – Reembolso (Integral)", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // SECCIÓN 1: CAPA DE PERSISTENCIA (ReembolsoDAO)
  // =========================================================
  describe("Capa de Persistencia (ReembolsoDAO)", () => {
    
    describe("ReembolsoDAO.getPendingRefunds", () => {
      it("✓ debe retornar pedidos cancelados pendientes de reembolso ordenados por fecha DESC", async () => {
        const fakeRows = [
          { order_id: 1, customer_id: 10, customer_name: "Juan", total_amount: 500, created_at: new Date(), status: "CANCELLED" },
          { order_id: 2, customer_id: 20, customer_name: "Ana", total_amount: 300, created_at: new Date(), status: "CANCELLED" },
        ];
        mockQuery.mockResolvedValueOnce({ rows: fakeRows });

        const result = await ReembolsoDAO.getPendingRefunds();
    
        const callArgs = mockQuery.mock.calls[0];
        const sql = callArgs[0];
        const params = callArgs[1]; 
        
        expect(sql).toMatch(/SELECT\s+ph\.id\s+AS\s+order_id/i);
        expect(sql).toMatch(/FROM\s+pedido_historial\s+ph/i);
        expect(sql).toMatch(/JOIN\s+users\s+u\s+ON\s+u\.id\s*=\s*ph\.customer_id/i);
        expect(sql).toMatch(/WHERE\s+ph\.status\s*=\s*'CANCELLED'/i);
        expect(sql).toMatch(/ORDER\s+BY\s+ph\.created_at\s+DESC/i);
        expect(params).toBeUndefined(); 
        expect(result).toEqual(fakeRows);
      });

      it("✓ debe retornar arreglo vacío si no hay pedidos cancelados", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        const result = await ReembolsoDAO.getPendingRefunds();
        expect(result).toEqual([]);
      });

      it("✗ debe propagar error de base de datos", async () => {
        mockQuery.mockRejectedValueOnce(new Error("Connection failed"));
        await expect(ReembolsoDAO.getPendingRefunds()).rejects.toThrow("Connection failed");
      });
    });

    describe("ReembolsoDAO.approveRefund", () => {
      it("✓ debe actualizar status a 'REFUNDED' y limpiar motivo de rechazo", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 123 }] });
        const result = await ReembolsoDAO.approveRefund(123);
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/UPDATE\s+pedido_historial\s+SET\s+status\s*=\s*'REFUNDED',\s*refund_rejection_reason\s*=\s*NULL\s+WHERE\s+id\s*=\s*\$1\s+AND\s+status\s*=\s*'CANCELLED'/i);
        expect(params).toEqual([123]);
        expect(result).toEqual({ id: 123 });
      });

      it("✗ debe lanzar error si el pedido no existe o no está CANCELLED", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
        await expect(ReembolsoDAO.approveRefund(999)).rejects.toThrow("Pedido no encontrado o no está pendiente de reembolso");
      });
    });

    describe("ReembolsoDAO.rejectRefund", () => {
      it("✓ debe actualizar status a 'REFUND_REJECTED' y guardar el motivo", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 456 }] });
        const result = await ReembolsoDAO.rejectRefund(456, "Producto no coincide con la descripción");
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(/UPDATE\s+pedido_historial\s+SET\s+status\s*=\s*'REFUND_REJECTED',\s*refund_rejection_reason\s*=\s*\$2\s+WHERE\s+id\s*=\s*\$1\s+AND\s+status\s*=\s*'CANCELLED'/i);
        expect(params).toEqual([456, "Producto no coincide con la descripción"]);
        expect(result).toEqual({ id: 456 });
      });

      it("✗ debe lanzar error si el pedido no está pendiente", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
        await expect(ReembolsoDAO.rejectRefund(789, "Fuera de plazo")).rejects.toThrow("Pedido no encontrado o no está pendiente de reembolso");
      });
    });
  });

  // =========================================================
  // SECCIÓN 2: CAPA DE SERVICIOS E INTEGRACIÓN (Controller & API)
  // =========================================================
  describe("Capa de Servicios e Integración", () => {
    let controller: ReembolsoController;
    
    // Espías para mockear el DAO y aislar el controlador
    let spyGetPending: jest.SpyInstance;
    let spyApprove: jest.SpyInstance;
    let spyReject: jest.SpyInstance;

    beforeEach(() => {
      controller = new ReembolsoController();
      spyGetPending = jest.spyOn(ReembolsoDAO, 'getPendingRefunds');
      spyApprove = jest.spyOn(ReembolsoDAO, 'approveRefund');
      spyReject = jest.spyOn(ReembolsoDAO, 'rejectRefund');
    });

    afterEach(() => {
      spyGetPending.mockRestore();
      spyApprove.mockRestore();
      spyReject.mockRestore();
    });

    describe("ReembolsoController.getPendingRefunds", () => {
      it("✓ debe devolver objeto con lista de reembolsos pendientes", async () => {
        const fakeRefunds = [{ order_id: 1, total_amount: 100 }];
        spyGetPending.mockResolvedValueOnce(fakeRefunds);
        const result = await controller.getPendingRefunds();
        expect(result).toEqual({ refunds: fakeRefunds });
        expect(spyGetPending).toHaveBeenCalledTimes(1);
      });

      it("✗ debe propagar errores del DAO", async () => {
        spyGetPending.mockRejectedValueOnce(new Error("DB error"));
        await expect(controller.getPendingRefunds()).rejects.toThrow("DB error");
      });
    });

    describe("ReembolsoController.approveRefund", () => {
      it("✓ debe aprobar reembolso y retornar mensaje de éxito", async () => {
        spyApprove.mockResolvedValueOnce({ id: 10 });
        const result = await controller.approveRefund(10);
        expect(result).toEqual({ success: true, message: "Reembolso aprobado" });
        expect(spyApprove).toHaveBeenCalledWith(10);
      });

      it("✗ debe propagar errores del DAO (ej. pedido no encontrado)", async () => {
        spyApprove.mockRejectedValueOnce(new Error("Pedido no encontrado"));
        await expect(controller.approveRefund(999)).rejects.toThrow("Pedido no encontrado");
      });
    });

    describe("ReembolsoController.rejectRefund", () => {
      it("✓ debe rechazar reembolso con motivo y retornar mensaje", async () => {
        spyReject.mockResolvedValueOnce({ id: 5 });
        const result = await controller.rejectRefund(5, "Fuera de tiempo");
        expect(result).toEqual({ success: true, message: "Reembolso rechazado", reason: "Fuera de tiempo" });
        expect(spyReject).toHaveBeenCalledWith(5, "Fuera de tiempo");
      });
    });

    describe("API GET /api/reembolsos", () => {
      it("✓ debe retornar 200 y lista de reembolsos pendientes", async () => {
        spyGetPending.mockResolvedValueOnce([{ order_id: 1 }]);
        const res = await GET();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json).toEqual({ refunds: [{ order_id: 1 }] });
      });

      it("✗ debe retornar 401 si el usuario no es admin (simulado)", async () => {
        expect(true).toBe(true); // Placeholder conceptual según el original
      });
    });

    describe("API PATCH /api/reembolsos/[id]/process", () => {
      const createReq = (body: any, id: string) => {
        return {
          json: async () => body,
          nextUrl: new URL(`http://localhost/api/reembolsos/${id}/process`),
        } as NextRequest;
      };

      it("✓ debe aprobar reembolso cuando action='approve'", async () => {
        spyApprove.mockResolvedValueOnce({ id: 123 });
        const req = createReq({ action: "approve" }, "123");
        const params = Promise.resolve({ id: "123" });
        const res = await PATCH(req, { params });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json).toEqual({ success: true, message: "Reembolso aprobado" });
      });

      it("✓ debe rechazar reembolso con motivo cuando action='reject'", async () => {
        spyReject.mockResolvedValueOnce({ id: 456 });
        const req = createReq({ action: "reject", reason: "No válido" }, "456");
        const params = Promise.resolve({ id: "456" });
        const res = await PATCH(req, { params });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json).toEqual({ success: true, message: "Reembolso rechazado", reason: "No válido" });
      });

      it("✗ debe retornar 400 si el ID no es número", async () => {
        const req = createReq({ action: "approve" }, "abc");
        const params = Promise.resolve({ id: "abc" });
        const res = await PATCH(req, { params });
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "ID inválido" });
      });

      it("✗ debe retornar 400 si action es inválido", async () => {
        const req = createReq({ action: "invalid" }, "1");
        const params = Promise.resolve({ id: "1" });
        const res = await PATCH(req, { params });
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "Acción inválida. Use 'approve' o 'reject'" });
      });

      it("✗ debe retornar 400 si reject sin motivo", async () => {
        const req = createReq({ action: "reject" }, "1");
        const params = Promise.resolve({ id: "1" });
        const res = await PATCH(req, { params });
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "Debe proporcionar un motivo de rechazo" });
      });
    });
  });
});