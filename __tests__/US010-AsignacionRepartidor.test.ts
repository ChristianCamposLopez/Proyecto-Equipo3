/**
 * US010: Asignación de repartidores
 * Pruebas sobre la lógica de vinculación de repartidor a pedido.
 */

import { PATCH } from "@/app/api/orders/[id]/status/route";
import { db } from "@/config/db";
import { PedidoService } from "@/services/PedidoService";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

describe("US010: Eficiencia Operativa – Asignación de repartidores", () => {
  
  beforeAll(() => {
    console.log(">>> [LOGICA] Verificando US010: Asignación de repartidores...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("✓ DEBE asignar repartidor y actualizar estado (Camino Feliz)", async () => {
    console.log("  -> Caso: Asignación exitosa de repartidor a orden activa");
    
    // Mock para el update de repartidor (línea 23 de route.ts)
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    
    // Mock para el PedidoService.updateOrderStatus
    jest.spyOn(PedidoService.prototype, 'updateOrderStatus').mockResolvedValue({ id: 5, status: 'ACCEPTED' } as any);

    const req = new Request("http://localhost/api/orders/5/status", {
      method: "PATCH",
      body: JSON.stringify({ deliverymanId: 8, status: "ACCEPTED" })
    });

    const res = await PATCH(req as any, { params: { id: "5" } } as any);
    
    expect(res.status).toBe(200);
    expect(mockQuery).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE orders SET deliveryman_id = \$1/i),
        [8, 5]
    );
  });

  it("⚠ DEBE fallar si no se puede actualizar el repartidor en DB", async () => {
    console.log("  -> Caso: Error de base de datos en asignación");
    mockQuery.mockRejectedValueOnce(new Error("Database error on assignment"));

    const req = new Request("http://localhost/api/orders/5/status", {
      method: "PATCH",
      body: JSON.stringify({ deliverymanId: 8, status: "ACCEPTED" })
    });

    const res = await PATCH(req as any, { params: { id: "5" } } as any);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Database error on assignment");
  });
});
