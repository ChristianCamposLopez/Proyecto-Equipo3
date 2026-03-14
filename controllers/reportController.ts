// controllers/reportController.ts
import { ReportService } from "@/services/ReportService"

export const getDailySales = async () => {
    return ReportService.getDailySales()
}