// controllers/reportController.ts
import { ReportService } from "@/services/ReportService"

const dao = new ReportDAO();

/**
 * Función legada para obtener ventas diarias
 */
export const getDailySales = async () => {
    return ReportService.getDailySales()
}