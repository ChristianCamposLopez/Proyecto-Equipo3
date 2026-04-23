import { NextResponse } from "next/server"
import { db } from "@/config/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customer_id, restaurant_id, items, total_amount } = body

    // Validations
    if (!customer_id || !restaurant_id) {
      return NextResponse.json(
        { error: "customer_id y restaurant_id son requeridos" },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Tu carrito está vacío" },
        { status: 400 }
      )
    }

    if (!total_amount || total_amount <= 0) {
      return NextResponse.json(
        { error: "El monto total debe ser mayor a 0" },
        { status: 400 }
      )
    }

    const client = await db.connect()

    try {
      // Start transaction
      await client.query("BEGIN")

      // Validate that all products exist
      for (const item of items) {
        if (!item.product_id || !item.quantity || !item.unit_price_at_purchase) {
          throw new Error("Cada item debe tener product_id, quantity, y unit_price_at_purchase")
        }

        const productCheck = await client.query(
          "SELECT id FROM products WHERE id = $1",
          [item.product_id]
        )

        if (productCheck.rows.length === 0) {
          throw new Error(`Producto #${item.product_id} no existe o fue eliminado. Por favor recarga la página y agrega los productos de nuevo.`)
        }
      }

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (customer_id, restaurant_id, status, total_amount, created_at)
         VALUES ($1, $2, 'PENDING', $3, NOW())
         RETURNING id`,
        [customer_id, restaurant_id, total_amount]
      )

      if (!orderResult.rows || orderResult.rows.length === 0) {
        throw new Error("No se pudo crear la orden en la base de datos")
      }

      const order_id = orderResult.rows[0].id

      // Add items to order
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase)
           VALUES ($1, $2, $3, $4)`,
          [order_id, item.product_id, item.quantity, item.unit_price_at_purchase]
        )
      }

      // Commit transaction
      await client.query("COMMIT")

      return NextResponse.json({
        success: true,
        order_id,
        message: `Orden #${order_id} creada exitosamente`
      })
    } catch (error) {
      await client.query("ROLLBACK")
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("Transaction error:", errorMessage)
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error al crear el pedido"
    console.error("Error creating order:", errorMessage, error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
