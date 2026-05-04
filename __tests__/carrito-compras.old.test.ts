/**
 * Carrito de compras
 * Pruebas unitarias sobre agregado de productos y resumen del carrito.
 */

const mockDbQuery = jest.fn();
const mockConnect = jest.fn();

jest.mock("@/config/db", () => ({
  db: {
    query: (...args: unknown[]) => mockDbQuery(...args),
    connect: (...args: unknown[]) => mockConnect(...args),
  },
}));

import { addItemToCart, updateCartItemQuantity } from "@/lib/cart";

describe("Carrito de compras", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("agrega un producto disponible al carrito y devuelve el resumen actualizado", async () => {
    const mockClientQuery = jest
      .fn()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});
    const mockRelease = jest.fn();

    mockDbQuery
      .mockResolvedValueOnce({
        rows: [{ id: 10, customer_id: 1, restaurant_id: null }],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 7,
            name: "Pizza especial",
            base_price: 150,
            stock: 5,
            is_available: true,
            restaurant_id: 3,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 10, customer_id: 1, restaurant_id: 3 }],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 55,
            product_id: 7,
            product_name: "Pizza especial",
            category_name: "Pizzas",
            image_url: null,
            quantity: 2,
            available_stock: 5,
            is_available: true,
            unit_price: 150,
            subtotal: 300,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ name: "Pizzería Roma" }],
      });

    mockConnect.mockResolvedValue({
      query: mockClientQuery,
      release: mockRelease,
    });

    const summary = await addItemToCart(1, 7, 2);

    expect(mockClientQuery).toHaveBeenCalledWith("BEGIN");
    expect(mockClientQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO cart_items"),
      [10, 7, 2, 150]
    );
    expect(summary).toMatchObject({
      id: 10,
      customer_id: 1,
      restaurant_id: 3,
      restaurant_name: "Pizzería Roma",
      item_count: 1,
      total_quantity: 2,
      total_amount: 300,
    });
    expect(summary.items).toHaveLength(1);
    expect(mockRelease).toHaveBeenCalled();
  });

  it("rechaza cantidades no enteras al actualizar un producto del carrito", async () => {
    await expect(updateCartItemQuantity(1, 15, 1.5)).rejects.toThrow(
      "La cantidad debe ser un entero"
    );
    expect(mockDbQuery).not.toHaveBeenCalled();
  });
});
