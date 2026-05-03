import { GET, POST } from "@/app/api/orders/route";
import { db } from "@/config/db";
import { checkoutCart, resolveCustomerId } from "@/lib/cart";
import { NextResponse } from "next/server";

// --- MOCKS ---
jest.mock("@/config/db", () => ({
  db: {
    query: jest.fn(),
  },
}));

jest.mock("@/lib/cart", () => ({
  checkoutCart: jest.fn(),
  resolveCustomerId: jest.fn(),
}));

describe("US011: Confirmación de Pedido - Pruebas de Persistencia y Servicio", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // 1. PRUEBAS DE PERSISTENCIA (QUERY SQL)
  // ==========================================
  describe("Capa de Persistencia (Lectura de Pedidos)", () => {
    it("debe incluir el campo 'status' en la consulta SQL", async () => {
      const mockOrder = {
        id: 101,
        status: "ACCEPTED", // Estado clave para la US011
        total_amount: 150.0,
        deliveryman_name: "Juan Chofer",
        created_at: new Date().toISOString(),
      };

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockOrder] });
      (resolveCustomerId as jest.Mock).mockReturnValue(1);

      const req = new Request("http://localhost/api/orders?customerId=1");
      const res = await GET(req);
      const data = await res.json();

      // Verificamos que el servicio retorna lo que la DB entregó
      expect(data[0]).toHaveProperty("status", "ACCEPTED");
      expect(data[0]).toHaveProperty("deliveryman_name", "Juan Chofer");
      
      // Verificamos que la query SQL fue llamada correctamente
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        expect.arrayContaining([1])
      );
    });
  });

  // ==========================================
  // 2. PRUEBAS DE SERVICIO (LÓGICA DE NEGOCIO)
  // ==========================================
  describe("Capa de Servicio (Creación y Respuesta)", () => {
    
    it("✓ POST: debe crear un pedido y retornar el objeto para la página de confirmación", async () => {
      const mockNewOrder = {
        id: 500,
        status: "PENDING",
        total_amount: 320.50,
        note: "Entregar en puerta"
      };

      (resolveCustomerId as jest.Mock).mockReturnValue(1);
      (checkoutCart as jest.Mock).mockResolvedValueOnce(mockNewOrder);

      const req = new Request("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerId: "user123",
          note: "Entregar en puerta",
          deliveryAddressId: 1
        }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.id).toBe(500);
      expect(data.status).toBe("PENDING");
    });

    it("✗ GET: debe manejar errores de base de datos con un 500", async () => {
      (db.query as jest.Mock).mockRejectedValueOnce(new Error("Conexión perdida"));

      const req = new Request("http://localhost/api/orders");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe("No se pudieron obtener los pedidos");
    });

    it("✗ POST: debe retornar 400 si la dirección de entrega falta (Lógica de Negocio)", async () => {
        (resolveCustomerId as jest.Mock).mockReturnValue(1);
        (checkoutCart as jest.Mock).mockRejectedValueOnce(new Error("Se requiere una dirección"));

        const req = new Request("http://localhost/api/orders", {
          method: "POST",
          body: JSON.stringify({ customerId: "u1" }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toContain("dirección");
    });
  });
});