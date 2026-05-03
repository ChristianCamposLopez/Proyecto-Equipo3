// services/VentasService.ts
// US006: Reportes de ventas diarias.
// US015: Exportación de información a Excel/CSV.
import { VentasDAO } from '@/models/daos/VentasDAO';
import { ExportService, VentasExportData, ExportMetadata } from '@/services/ExportService';
import { VentaDiaria } from '@/models/entities/VentaDiariaEntity';

export class VentasService {
  async getDailyReport(fecha: string, restauranteId?: number): Promise<VentaDiaria | null> {
    if (!fecha) throw new Error('La fecha es requerida');
    return await VentasDAO.getDailySalesReport(fecha, restauranteId);
  }

  async getRestaurantName(restauranteId: number): Promise<string> {
    return await VentasDAO.getRestaurantName(restauranteId) || `ID: ${restauranteId}`;
  }

  async exportSales(inicio: string, fin?: string, restauranteId?: number, format: 'excel' | 'pdf' = 'excel') {
    if (!inicio) throw new Error('Fecha de inicio requerida');
    const ventas = await VentasDAO.getSalesReport({ fechaInicio: inicio, fechaFin: fin, restauranteId });
    const restaurantName = await VentasDAO.getRestaurantName(restauranteId ?? 0);
    
    const exportData: VentasExportData[] = ventas.map(v => ({
      fecha: v.fecha,
      total_ventas: v.total_ventas,
      numero_pedidos: v.numero_pedidos
    }));

    const metadata: ExportMetadata = {
      restaurantName,
      startDate: inicio,
      endDate: fin || inicio,
      generatedAt: new Date().toLocaleString(),
      totalDias: ventas.length
    };

    const buffer = ExportService.exportVentas(exportData, metadata, format);
    return { buffer, fileName: `ventas_${inicio}.${format === 'pdf' ? 'pdf' : 'xlsx'}` };
  }

  // US015: Exportación simplificada a CSV
  async exportSalesCSV(restauranteId: number): Promise<string> {
    const ventas = await VentasDAO.getSalesReport({ restauranteId });
    let csv = "fecha,total_ventas,numero_pedidos\n";
    ventas.forEach(v => {
      csv += `${v.fecha},${v.total_ventas},${v.numero_pedidos}\n`;
    });
    return csv;
  }
}