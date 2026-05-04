/**
 * US013: Estado de Pedido (Cocina/Reparto)
 * Pruebas sobre la actualización de estados de pedidos activos.
 */

import { PATCH } from "@/app/api/orders/[id]/status/route";
import { PedidoService } from "@/services/PedidoService";
import { db } from "@/config/db";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

describe("US013: Gestión de Estados de Pedido – Verificación Lógica", () => {
  
  beforeAll(() => {
    console.log(">>> [LOGICA] Verificando US013: Actualización de Estados (Cocina/Reparto)...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("✓ DEBE actualizar estado a 'READY' exitosamente (Camino Feliz)", async () => {
    console.log("  -> Caso: Cambio de estado válido");
    const mockUpdated = { id: 1, status: 'READY' };
    const spy = jest.spyOn(PedidoService.prototype, 'updateOrderStatus').mockResolvedValue(mockUpdated as any);

    const req = new Request("http://localhost/api/orders/1/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "READY" })
    });

    const res = await PATCH(req as any, { params: { id: "1" } } as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("READY");
    expect(spy).toHaveBeenCalledWith(1, "READY");
    spy.mockRestore();
  });

  it("⚠ DEBE asignar repartidor si se provee deliverymanId", async () => {
    console.log("  -> Caso: Asignación de repartidor + Cambio de estado");
    jest.spyOn(PedidoService.prototype, 'updateOrderStatus').mockResolvedValue({ id: 1, status: 'ACCEPTED' } as any);
    mockQuery.mockResolvedValueOnce({ rowCount: 1 }); // UPDATE deliveryman_id

    const req = new Request("http://localhost/api/orders/1/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "ACCEPTED", deliverymanId: 5 })
    });

    const res = await PATCH(req as any, { params: { id: "1" } } as any);
    
    expect(mockQuery).toHaveBeenCalledWith(
        expect.stringMatching(/SET deliveryman_id = \$1/i),
        [5, 1]
    );
    expect(res.status).toBe(200);
  });

  it("⚠ DEBE retornar 400 si el ID es inválido", async () => {
    console.log("  -> Caso: ID no numérico ('abc')");
    const req = new Request("http://localhost/api/orders/abc/status", {
        method: "PATCH",
        body: JSON.stringify({ status: "READY" })
    });

    const res = await PATCH(req as any, { params: { id: "abc" } } as any);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "ID inválido" });
  });

  it("✗ DEBE retornar 500 si falla la lógica de negocio (Transición inválida)", async () => {
    console.log("  -> Caso: Error de negocio propagado (Status transition fail)");
    jest.spyOn(PedidoService.prototype, 'updateOrderStatus').mockRejectedValue(new Error("Transición no permitida"));

    const req = new Request("http://localhost/api/orders/1/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "PENDING" }) // Retroceder a PENDING suele fallar
    });

    const res = await PATCH(req as any, { params: { id: "1" } } as any);
    
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Transición no permitida" });
    jest.restoreAllMocks();
  });
});
