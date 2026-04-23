import { getDailySales } from "@/controllers/reportController"

export async function GET() {
    type SaleRow = {
        day: string;
        total_orders: number;
        total_sales: number;
        average_ticket: number;
    };

    try {
        const sales = (await getDailySales()) as SaleRow[];
        let csv = "day,total_orders,total_sales,average_ticket\n";

        if (sales && sales.length > 0) {
            sales.forEach((row) => {
                csv += `${row.day},${row.total_orders},${row.total_sales},${row.average_ticket}\n`;
            });
        }

        return new Response(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": "attachment; filename=sales.csv",
            },
        });
    } catch (error) {
        console.error('[GET /api/reports/daily-sales/csv]', error);
        return new Response("day,total_orders,total_sales,average_ticket\n", {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": "attachment; filename=sales.csv",
            },
        });
    }
}