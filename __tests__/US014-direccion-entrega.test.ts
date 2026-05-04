/**
 * US014: Gestión de Direcciones de Entrega
 * Pruebas sobre validaciones de formato y persistencia de direcciones.
 */

import { DireccionService } from "@/services/DireccionService";
import { DireccionDAO } from "@/models/daos/DireccionDAO";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/models/daos/DireccionDAO");

describe("US014: Gestión de Direcciones – Verificación Lógica", () => {
  let service: DireccionService;

  beforeAll(() => {
    console.log(">>> [LOGICA] Verificando US014: Gestión de Direcciones de Entrega...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DireccionService();
  });

  describe("DireccionService.registrarDireccion", () => {
    
    it("✓ DEBE registrar dirección válida (Camino Feliz)", async () => {
      console.log("  -> Caso: Datos completos y correctos");
      (DireccionDAO.crear as jest.Mock).mockResolvedValue({ id: 1 });

      const datos = {
        street: "Av. Siempre Viva",
        city: "Springfield",
        state: "State",
        postalCode: "12345"
      };

      const result = await service.registrarDireccion(1, datos);
      expect(result.id).toBe(1);
    });

    it("⚠ DEBE rechazar si falta la calle o ciudad", async () => {
      console.log("  -> Caso: Datos faltantes");
      await expect(service.registrarDireccion(1, { street: "" }))
        .rejects.toThrow("La calle y ciudad son requeridas");
    });

    it("⚠ DEBE validar que el código postal tenga 5 dígitos", async () => {
      console.log("  -> Caso: CP inválido ('123')");
      const datos = {
        street: "Calle 1",
        city: "CDMX",
        postalCode: "123"
      };

      await expect(service.registrarDireccion(1, datos))
        .rejects.toThrow("El código postal debe tener 5 dígitos");
    });
  });

  describe("DireccionService.eliminarDireccion", () => {
    it("✓ DEBE llamar al DAO para eliminar", async () => {
      console.log("  -> Caso: Eliminación de dirección");
      await service.eliminarDireccion(10);
      expect(DireccionDAO.eliminar).toHaveBeenCalledWith(10);
    });
  });
});
