// services/ReportService.ts
import { ReportDAO } from "@/models/daos/ReportDAO";

export class ReportService {

  static async getDailySales() {
    // US006: Reporte de ventas diarias resumido
    const data = await ReportDAO.getDailySalesReportSummary(1);
    // Transform 'date' to 'day' and other fields for legacy compatibility
    return data.map(row => ({
      day: row.date,
      total_orders: row.total_orders,
      total_sales: row.total_revenue,
      average_ticket: row.avg_order_value
    }));
  }

  static async getDailySalesReport() {
    // US006: Reporte de ventas diarias
    return ReportDAO.getDailySalesReportSummary(1);
  }

  static async exportDailySalesCSV() {
    // US015: Exportación de reportes
    const data = await this.getDailySales();
    let csv = "day,total_orders,total_sales,average_ticket\n";
    data.forEach(row => {
      csv += `${row.day},${row.total_orders},${row.total_sales},${row.average_ticket}\n`;
    });
    return csv;
  }

  static async exportDailySalesExcel() {
    throw new Error("Excel export not implemented in ReportService, use VentasService instead");
  }

  static async exportSalesExcel() {
    throw new Error("Excel export not implemented in ReportService, use VentasService instead");
  }
}

