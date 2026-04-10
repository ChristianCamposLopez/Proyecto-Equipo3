import {db} from "../../config/db"

export class ReportDAO {

    static async getDailySales(){

        const query = `
        SELECT 
        DATE(p.created_at) as day,
        COUNT(p.id) as total_orders,
        SUM(o.total_amount) as total_sales,
        AVG(o.total_amount) as average_ticket
        FROM payments p
        JOIN orders o ON o.id = p.order_id
        WHERE p.status='SUCCESS'
        GROUP BY DATE(p.created_at)
        ORDER BY day DESC
        `

        const result = await db.query(query)

        return result.rows
    }

}