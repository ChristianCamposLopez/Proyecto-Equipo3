import { getDailySales } from "@/controllers/reportController"

export async function GET() {
    type SaleRow = {
        day: string;
        total_orders: number;
        total_sales: number;
        average_ticket: number;
    };

    const sales = (await getDailySales()) as SaleRow[];

    let csv = "day,total_orders,total_sales,average_ticket\n";

    sales.forEach((row) => {
        csv += `${row.day},${row.total_orders},${row.total_sales},${row.average_ticket}\n`;
    });

    return new Response(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=sales.csv",
        },
    });
}