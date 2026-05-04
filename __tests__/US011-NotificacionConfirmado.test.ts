/**
 * US011: Confirmación de Pedido
 * Pruebas sobre la creación de pedidos (checkout) y consulta de estados.
 */

import { GET, POST } from "@/app/api/orders/route";
import { PedidoService } from "@/services/PedidoService";
import { db } from "@/config/db";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

describe("US011: Confirmación de Pedido – Verificación Lógica", () => {
  
  beforeAll(() => {
    console.log(">>> [LOGICA] Verificando US011: Creación y Estados de Pedido...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // 1. CREACIÓN DE PEDIDO (POST)
  // ==========================================
  describe("POST /api/orders (Checkout)", () => {
    
    it("✓ DEBE crear un pedido exitosamente (Camino Feliz)", async () => {
      console.log("  -> Caso: Checkout válido con items en carrito");
      const spy = jest.spyOn(PedidoService.prototype, 'checkout').mockResolvedValue({
        success: true,
        orderId: 100,
        total: 50.5
      });

      const req = new Request("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify({ customerId: "1", note: "Sin cebolla", deliveryAddressId: 10 })
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.id).toBe(100);
      expect(spy).toHaveBeenCalledWith(1, "Sin cebolla", 10);
      spy.mockRestore();
    });

    it("⚠ DEBE rechazar si el customerId no es un número (Validación de Tipos)", async () => {
      console.log("  -> Caso: customerId inválido ('abc')");
      const req = new Request("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify({ customerId: "abc" })
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("customerId inválido");
    });

    it("✗ DEBE propagar error de negocio (ej. Carrito vacío)", async () => {
      console.log("  -> Caso: Error lanzado por PedidoService (Carrito vacío)");
      jest.spyOn(PedidoService.prototype, 'checkout').mockRejectedValue(new Error("El carrito está vacío"));

      const req = new Request("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify({ customerId: "1" })
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("El carrito está vacío");
      jest.restoreAllMocks();
    });
  });

  // ==========================================
  // 2. CONSULTA DE ESTADOS (GET)
  // ==========================================
  describe("GET /api/orders (Trazabilidad)", () => {
    it("✓ DEBE retornar lista de pedidos filtrada por cliente", async () => {
      console.log("  -> Caso: Consulta de historial activo por customerId");
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'PENDING' }] });

      const req = new Request("http://localhost/api/orders?customerId=1");
      const res = await GET(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringMatching(/WHERE\s+1=1\s+AND\s+o\.customer_id\s*=\s*\$1/i), [1]);
    });

    it("✗ DEBE retornar 500 ante fallo crítico de base de datos", async () => {
      console.log("  -> Caso: Error crítico en consulta SQL");
      mockQuery.mockRejectedValueOnce(new Error("DB Connection Error"));

      const req = new Request("http://localhost/api/orders");
      const res = await GET(req as any);
      
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: "No se pudieron obtener los pedidos" });
    });
  });
});