/**
 * US002: Carrito de compras
 * Pruebas unitarias sobre agregado de productos y resumen del carrito utilizando CarritoService.
 */

import { CarritoService } from "@/services/CarritoService";
import { CarritoDAO } from "@/models/daos/CarritoDAO";
import { ProductoDAO } from "@/models/daos/ProductoDAO";
import { RestaurantDAO } from "@/models/daos/RestaurantDAO";

// Mocking the DAOs
jest.mock("@/models/daos/CarritoDAO");
jest.mock("@/models/daos/ProductoDAO");
jest.mock("@/models/daos/RestaurantDAO");

describe("US002: Carrito de compras (CarritoService)", () => {
  let service: CarritoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CarritoService();
  });

  it("agrega un producto disponible al carrito y devuelve el resumen actualizado", async () => {
    // 1. Mock de CarritoDAO para getOrCreateCart
    (CarritoDAO.getActiveCart as jest.Mock).mockResolvedValue({ id: 10, customer_id: 1, restaurant_id: null });
    
    // 2. Mock de ProductoDAO
    (ProductoDAO.findByIdIncludingInactive as jest.Mock).mockResolvedValue({
      id: 7,
      name: "Pizza especial",
      base_price: 150,
      stock: 5,
      is_available: true
    });

    // 3. Mock de CarritoDAO.getItems (carrito vacío inicialmente)
    (CarritoDAO.getItems as jest.Mock)
      .mockResolvedValueOnce([]) // Al inicio de agregarProducto
      .mockResolvedValueOnce([    // Al llamar a getSummary después de agregar
        {
          id: 55,
          product_id: 7,
          product_name: "Pizza especial",
          quantity: 2,
          subtotal: 300
        }
      ]);

    // 4. Mock de RestaurantDAO
    (RestaurantDAO.findById as jest.Mock).mockResolvedValue({ id: 3, name: "Pizzería Roma" });

    // Ejecutar
    const summary = await service.agregarProducto(1, 7, 2);

    // Verificaciones
    expect(CarritoDAO.addItem).toHaveBeenCalledWith(10, 7, 2, 150);
    expect(summary).toMatchObject({
      id: 10,
      customer_id: 1,
      restaurant_name: "Pizzería Roma",
      item_count: 1,
      total_quantity: 2,
      total_amount: 348, // 300 + 16% IVA
    });
  });

  it("rechaza agregar un producto si no hay stock suficiente", async () => {
    (CarritoDAO.getActiveCart as jest.Mock).mockResolvedValue({ id: 10, customer_id: 1 });
    (ProductoDAO.findByIdIncludingInactive as jest.Mock).mockResolvedValue({
      id: 7,
      stock: 5,
      is_available: true
    });
    (CarritoDAO.getItems as jest.Mock).mockResolvedValue([]);

    await expect(service.agregarProducto(1, 7, 10)).rejects.toThrow("Stock insuficiente");
  });

  it("rechaza cantidades negativas", async () => {
    await expect(service.agregarProducto(1, 7, -1)).rejects.toThrow("La cantidad debe ser mayor a cero");
  });
});
