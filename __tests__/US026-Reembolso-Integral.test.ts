import { ReembolsoDAO } from "@/models/daos/ReembolsoDAO";
import { ReembolsoService } from "@/services/ReembolsoService";
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

describe("US026: Gestión de Reembolsos - VERIFICACIÓN LÓGICA", () => {
  
  beforeAll(() => {
    console.log(">>> [LOGICA] Verificando US026: Sistema de Reembolsos...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // 1. CAPA DE PERSISTENCIA (ReembolsoDAO)
  // =========================================================
  describe("Capa de Persistencia (ReembolsoDAO)", () => {
    it("✓ debe obtener reembolsos con datos de usuario (Simulación Seed)", async () => {
      const fakeRows = [
        { order_id: 1, customer_name: "Juan Perez", total_amount: 500, created_at: "2024-05-01", status: "CANCELLED" }
      ];
      mockQuery.mockResolvedValueOnce({ rows: fakeRows });

      const result = await ReembolsoDAO.getPendingRefunds(1);
      expect(result[0].customer_name).toBe("Juan Perez");
      expect(mockQuery).toHaveBeenCalledWith(expect.stringMatching(/JOIN\s+users/i), [1]);
    });
  });

  // =========================================================
  // 2. CAPA DE SERVICIOS (ReembolsoService)
  // =========================================================
  describe("Capa de Servicios (ReembolsoService)", () => {
    it("⚠ debe lanzar el mensaje de error EXACTO definido en el servicio", async () => {
      console.log("  -> Verificando mensaje de error: 'Se requiere un motivo de rechazo'");
      const service = new ReembolsoService();
      
      // El servicio lanza "Se requiere un motivo de rechazo"
      await expect(service.rejectRefund(1, ""))
        .rejects.toThrow("Se requiere un motivo de rechazo");
    });

    it("⚠ debe fallar si el pedido no está en estado cancelado", async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 }); // Simula que no se afectó ninguna fila (no era CANCELLED)
      const service = new ReembolsoService();
      await expect(service.approveRefund(99))
        .rejects.toThrow("PedidoEntity no encontrado o no está pendiente de reembolso");
    });
  });

  // =========================================================
  // 3. CAPA API (Controllers)
  // =========================================================
  describe("API Integration (PATCH)", () => {
    it("✗ DEBE retornar 400 si falta adminId (Según implementación actual)", async () => {
        console.log("  -> Verificando denegación por falta de adminId");
        const req = {
            json: async () => ({ action: 'approve' })
        } as unknown as NextRequest;

        const res = await PATCH(req, { params: Promise.resolve({ id: "1" }) });
        expect(res.status).toBe(400); // Según route.ts: return NextResponse.json({ error: "Acceso denegado" }, { status: 400 });
        const json = await res.json();
        expect(json.error).toBe("Acceso denegado");
    });

    it("✗ DEBE retornar 400 si la acción es de rechazo pero falta el motivo", async () => {
        const req = {
            json: async () => ({ action: 'reject', reason: '', adminId: 'admin1' })
        } as unknown as NextRequest;

        const res = await PATCH(req, { params: Promise.resolve({ id: "1" }) });
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("Motivo de rechazo requerido");
    });
  });
});