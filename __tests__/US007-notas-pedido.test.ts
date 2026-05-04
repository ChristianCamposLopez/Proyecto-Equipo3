/**
 * US007: Notas de pedidos
 * Pruebas unitarias sobre normalización y guardado de notas utilizando PedidoService.
 */

import { PedidoService } from "@/services/PedidoService";
import { CarritoDAO } from "@/models/daos/CarritoDAO";
import { db } from "@/config/db";

// Mocking
jest.mock("@/models/daos/CarritoDAO");
jest.mock("@/models/daos/PedidoDAO");
jest.mock("@/config/db", () => ({
  db: {
    connect: jest.fn(),
    query: jest.fn()
  }
}));

describe("US007: Notas de pedidos (PedidoService)", () => {
  let service: PedidoService;

  beforeAll(() => {
    console.log(">>> Probando US007: Notas Especiales en Pedidos...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PedidoService();
  });

  it("normaliza una nota válida eliminando espacios extras", () => {
    expect(service.normalizeOrderNote("  Sin salsa y con extra queso  ")).toBe(
      "Sin salsa y con extra queso"
    );
  });

  it("rechaza notas con más de 200 caracteres", () => {
    expect(() => service.normalizeOrderNote("a".repeat(201))).toThrow(
      "La nota no puede exceder 200 caracteres"
    );
  });

  it("guarda la nota normalizada al confirmar el checkout", async () => {
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // SELECT address
        .mockResolvedValueOnce({ rows: [{ id: 120 }] }) // INSERT order
        .mockResolvedValueOnce({ rows: [] }) // INSERT items
        .mockResolvedValueOnce({ rows: [] }), // COMMIT
      release: jest.fn()
    };

    (db.connect as jest.Mock).mockResolvedValue(mockClient);
    (CarritoDAO.getActiveCart as jest.Mock).mockResolvedValue({ id: 99, restaurant_id: 8 });
    (CarritoDAO.getItems as jest.Mock).mockResolvedValue([
      { product_id: 7, quantity: 2, unit_price: 150, subtotal: 300 }
    ]);

    const result = await service.checkout(1, "  Sin cebolla  ", 4);

    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO orders"),
      expect.arrayContaining(["Sin cebolla"])
    );
    expect(result.success).toBe(true);
    expect(result.orderId).toBe(120);
    expect(mockClient.release).toHaveBeenCalled();
  });
});
