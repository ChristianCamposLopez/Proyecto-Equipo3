import {db} from "../config/db"
import { RefundDAO } from "../models/daos/RefundDAO"

export const cancelOrder = async (orderId:number) => {

    const paymentQuery = `
    SELECT * FROM payments
    WHERE order_id = $1
    AND status = 'SUCCESS'
    `

    const paymentResult = await db.query(paymentQuery,[orderId])

    if(paymentResult.rows.length === 0){
        throw new Error("No payment found")
    }

    const payment = paymentResult.rows[0]

    await RefundDAO.create({
        payment_id: payment.id,
        amount: payment.amount,
        reason: "Order cancellation"
    })

    await db.query(
        "UPDATE payments SET status='REFUNDED' WHERE id=$1",
        [payment.id]
    )

    await db.query(
        "UPDATE orders SET status='CANCELLED' WHERE id=$1",
        [orderId]
    )

}