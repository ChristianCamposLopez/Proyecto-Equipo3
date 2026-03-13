import {db} from "../../config/db"
import { Refund } from "../entities/Refund"

export class RefundDAO {

    static async create(refund: Refund) {

        const query = `
        INSERT INTO refunds (payment_id, amount, reason)
        VALUES ($1,$2,$3)
        RETURNING *
        `

        const result = await db.query(query, [
            refund.payment_id,
            refund.amount,
            refund.reason
        ])

        return result.rows[0]
    }

}