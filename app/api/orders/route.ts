import { NextResponse } from "next/server"
import { db } from "@/config/db"
import { checkoutCart, resolveCustomerId } from "@/lib/cart"

export async function GET(request: Request){
    try {
        const { searchParams } = new URL(request.url)
        const customerId = searchParams.get("customerId")
        const parsedCustomerId = customerId ? resolveCustomerId(customerId) : null
        const params = parsedCustomerId ? [parsedCustomerId] : []

        const result = await db.query(
            `SELECT
                o.id,
                o.customer_id,
                o.restaurant_id,
                o.deliveryman_id,
                o.status,
                o.note,
                o.total_amount::float8 AS total_amount,
                o.created_at,
                (o.created_at + INTERVAL '45 minutes') AS estimated_delivery_at,
                u.full_name AS deliveryman_name
            FROM orders o
            LEFT JOIN users u ON u.id = o.deliveryman_id
            ${parsedCustomerId ? "WHERE o.customer_id = $1" : ""}
            ORDER BY o.created_at DESC`,
            params
        )

        return NextResponse.json(result.rows)
    } catch (error) {
        console.error("[GET /api/orders]", error)
        return NextResponse.json({ error: "No se pudieron obtener los pedidos" }, { status: 500 })
    }

}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const customerId = resolveCustomerId(body.customerId)
        const order = await checkoutCart(customerId, body.note, body.deliveryAddressId)

        return NextResponse.json(order, { status: 201 })
    } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo crear el pedido"
        const status =
            message.includes("200 caracteres") ||
            message.includes("vacío") ||
            message.includes("dirección")
                ? 400
                : 409
        return NextResponse.json({ error: message }, { status })
    }
}
