import { NextResponse } from "next/server"
import { db } from "@/config/db"

export async function GET() {
  try {
    const result = await db.query(
      `SELECT
          o.id,
          o.status,
          o.note,
          o.total_amount::float8 AS total_amount,
          o.created_at,
          u.full_name AS customer_name,
          COALESCE(
            json_agg(
              json_build_object(
                'product_name', p.name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price_at_purchase::float8
              )
              ORDER BY oi.id
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::json
          ) AS items
        FROM orders o
        LEFT JOIN users u ON u.id = o.customer_id
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE o.status IN ('PENDING', 'PREPARING', 'READY')
        GROUP BY o.id, u.full_name
        ORDER BY o.created_at DESC`
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("[GET /api/kitchen/orders]", error)
    return NextResponse.json({ error: "No se pudieron obtener los pedidos de cocina" }, { status: 500 })
  }
}
