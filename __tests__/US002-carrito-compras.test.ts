/**
 * US002: Carrito de Compras
 * Pruebas sobre la lógica de negocio de gestión de productos en el carrito virtual.
 */

import { CarritoService } from "@/services/CarritoService";
import { CarritoDAO } from "@/models/daos/CarritoDAO";
import { ProductoDAO } from "@/models/daos/ProductoDAO";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/models/daos/CarritoDAO");
jest.mock("@/models/daos/ProductoDAO");
jest.mock("@/models/daos/RestaurantDAO");

describe("US002: Carrito de Compras – Verificación Lógica Exhaustiva", () => {
  let service: CarritoService;

  beforeAll(() => {
    console.log(">>> [LOGICA] Verificando US002: Gestión del Carrito Virtual...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CarritoService();
  });

  describe("CarritoService.agregarProducto", () => {
    
    it("✓ DEBE agregar un producto nuevo al carrito (Camino Feliz)", async () => {
      console.log("  -> Caso: Producto disponible con stock");
      const customerId = 1;
      const productId = 101;
      const fakeProduct = { id: productId, stock: 10, base_price: 15.0, is_available: true };
      
      (CarritoDAO.getActiveCart as jest.Mock).mockResolvedValue({ id: 50, customer_id: customerId });
      (ProductoDAO.findByIdIncludingInactive as jest.Mock).mockResolvedValue(fakeProduct);
      (CarritoDAO.getItems as jest.Mock).mockResolvedValue([]); // Carrito vacío inicialmente
      (CarritoDAO.addItem as jest.Mock).mockResolvedValue({});

      await service.agregarProducto(customerId, productId, 2);

      expect(CarritoDAO.addItem).toHaveBeenCalledWith(50, productId, 2, 15.0);
    });

    it("⚠ DEBE rechazar cantidades negativas o cero", async () => {
      console.log("  -> Caso: Cantidad = 0 (Debe lanzar Error)");
      await expect(service.agregarProducto(1, 101, 0))
        .rejects.toThrow("La cantidad debe ser mayor a cero");
    });

    it("⚠ DEBE rechazar productos agotados", async () => {
      console.log("  -> Caso: Stock = 0");
      (CarritoDAO.getActiveCart as jest.Mock).mockResolvedValue({ id: 50 });
      (ProductoDAO.findByIdIncludingInactive as jest.Mock).mockResolvedValue({ id: 101, stock: 0, is_available: true });

      await expect(service.agregarProducto(1, 101, 1))
        .rejects.toThrow("Producto no disponible");
    });

    it("⚠ DEBE rechazar si se excede el stock disponible", async () => {
      console.log("  -> Caso: Pedir 11 cuando hay 10 en stock");
      (CarritoDAO.getActiveCart as jest.Mock).mockResolvedValue({ id: 50 });
      (ProductoDAO.findByIdIncludingInactive as jest.Mock).mockResolvedValue({ id: 101, stock: 10, is_available: true });
      (CarritoDAO.getItems as jest.Mock).mockResolvedValue([]);

      await expect(service.agregarProducto(1, 101, 11))
        .rejects.toThrow("Stock insuficiente");
    });

    it("✓ DEBE incrementar cantidad si el producto ya está en el carrito", async () => {
      console.log("  -> Caso: Actualizar item existente");
      const productId = 101;
      (CarritoDAO.getActiveCart as jest.Mock).mockResolvedValue({ id: 50 });
      (ProductoDAO.findByIdIncludingInactive as jest.Mock).mockResolvedValue({ id: productId, stock: 20, is_available: true });
      (CarritoDAO.getItems as jest.Mock).mockResolvedValue([
          { id: 1, product_id: productId, quantity: 5 }
      ]);
      const spyUpdate = (CarritoDAO.updateItemQuantity as jest.Mock).mockResolvedValue({});

      await service.agregarProducto(1, productId, 3);

      expect(spyUpdate).toHaveBeenCalledWith(1, 8); // 5 + 3 = 8
    });
  });
});
