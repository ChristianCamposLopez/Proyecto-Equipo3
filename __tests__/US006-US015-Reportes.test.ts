/**
 * US006 y US015: Reportes y Exportación
 * Pruebas sobre la generación de reportes de ventas y exportación de datos.
 */

import { VentasService } from "@/services/VentasService";
import { VentasDAO } from "@/models/daos/VentasDAO";
import { ExportService } from "@/services/ExportService";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/models/daos/VentasDAO");
jest.mock("@/services/ExportService", () => ({
  ExportService: {
    exportVentas: jest.fn().mockReturnValue(Buffer.from("fake-excel-data"))
  }
}));

describe("US006 & US015: Inteligencia de Negocio – Reportes y Exportación", () => {
  let service: VentasService;

  beforeAll(() => {
    console.log(">>> [LOGICA] Verificando US006 (Ventas) y US015 (Exportación)...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VentasService();
  });

  describe("US006: VentasService.getDailyReport", () => {
    it("✓ DEBE obtener el reporte diario correctamente", async () => {
      console.log("  -> Caso: Consulta de ventas del día");
      (VentasDAO.getDailySalesReport as jest.Mock).mockResolvedValue({
        fecha: "2024-05-01",
        total_ventas: 1500.50,
        numero_pedidos: 12
      });

      const report = await service.getDailyReport("2024-05-01", 1);
      
      expect(report?.total_ventas).toBe(1500.50);
      expect(VentasDAO.getDailySalesReport).toHaveBeenCalledWith("2024-05-01", 1);
    });

    it("⚠ DEBE rechazar si no se proporciona fecha", async () => {
      console.log("  -> Caso: Fecha nula");
      await expect(service.getDailyReport(""))
        .rejects.toThrow("La fecha es requerida");
    });
  });

  describe("US015: VentasService.exportSales (Excel/CSV)", () => {
    it("✓ DEBE llamar al ExportService con el formato correcto (Excel)", async () => {
      console.log("  -> Caso: Exportación a Excel");
      (VentasDAO.getSalesReport as jest.Mock).mockResolvedValue([
        { fecha: "2024-05-01", total_ventas: 100, numero_pedidos: 1 }
      ]);
      (VentasDAO.getRestaurantName as jest.Mock).mockResolvedValue("Restaurante Test");

      const result = await service.exportSales("2024-05-01");

      expect(ExportService.exportVentas).toHaveBeenCalled();
      expect(result.fileName).toContain(".xlsx");
    });

    it("✓ DEBE generar un string CSV válido", async () => {
      console.log("  -> Caso: Exportación a CSV simplificado");
      (VentasDAO.getSalesReport as jest.Mock).mockResolvedValue([
        { fecha: "2024-05-01", total_ventas: 500, numero_pedidos: 5 }
      ]);

      const csv = await service.exportSalesCSV(1);
      expect(csv).toContain("fecha,total_ventas,numero_pedidos");
      expect(csv).toContain("2024-05-01,500,5");
    });
  });
});
