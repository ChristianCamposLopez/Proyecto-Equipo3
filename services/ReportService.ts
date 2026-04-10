// services/ReportService.ts
import { ReportDAO } from "@/models/daos/ReportDAO";

export class ReportService {
  static async getDailySales() {
    // Aquí se podría añadir lógica de filtrado o transformación de datos a futuro
    const data = await ReportDAO.getDailySales();
    return data;
  }
}
