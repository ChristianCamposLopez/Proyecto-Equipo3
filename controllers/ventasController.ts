// controllers/ventasController.ts
import { VentaDAO } from '@/models/daos/ventasDAO';
import { ExportacionService, VentasExportData, VentasExportMetadata } from '@/services/ExportacionService';
import { VentaDiaria } from '@/models/entities/ventasEntity';

export class VentasController {
  private ventaDAO = new VentaDAO();

  // GET diario (sin cambios)
  async getDailyReport(fecha: string, restauranteId?: number): Promise<VentaDiaria | null> {
    if (!fecha) throw new Error('La fecha es requerida');
    return this.ventaDAO.getDailySalesReport(fecha, restauranteId);
  }

  async getRestaurantName(restaurantId: number): Promise<string> {
    return this.ventaDAO.getRestaurantName(restaurantId);
  }

  // Exportación con formato (excel/pdf)
  async exportSales(
    inicio: string,
    fin?: string,
    restauranteId?: number,
    format: 'excel' | 'pdf' = 'excel'   // por defecto Excel
  ): Promise<{ buffer: Buffer; fileName: string; metadata: VentasExportMetadata }> {
    if (!inicio) throw new Error('Fecha de inicio requerida');

    const ventas = await this.ventaDAO.getSalesReport({
      fechaInicio: inicio,
      fechaFin: fin,
      restauranteId,
    });

    const restaurantName = await this.ventaDAO.getRestaurantName(
      restauranteId ?? 0
    );
    

    const exportData: VentasExportData[] = ventas.map((v) => ({
      fecha: v.fecha,
      total_ventas: v.total_ventas,
      numero_pedidos: v.numero_pedidos,
    }));

    const metadata: VentasExportMetadata = {
      restaurantName,
      fechaInicio: inicio,
      fechaFin: fin || inicio,
      generatedAt: new Date().toLocaleString(),
      totalDias: ventas.length,
    };

    const buffer = ExportacionService.export(exportData, metadata, format);
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';
    const fileName = `ventas_${inicio}_${fin || inicio}.${extension}`;

    return { buffer, fileName, metadata };
  }
}