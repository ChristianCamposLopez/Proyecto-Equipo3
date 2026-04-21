import { NextResponse } from "next/server"
import { db } from "@/config/db"

export async function GET(){
  try {
    // Get first customer and restaurant (or create defaults)
    const users = await db.query("SELECT id FROM users ORDER BY id LIMIT 1")
    const restaurants = await db.query("SELECT id FROM restaurants ORDER BY id LIMIT 1")

    let customer_id = 1
    let restaurant_id = 1

    if (users.rows.length > 0) {
      customer_id = users.rows[0].id
    }

    if (restaurants.rows.length > 0) {
      restaurant_id = restaurants.rows[0].id
    }

    return NextResponse.json({
      customer_id,
      restaurant_id
    })
  } catch (error) {
    console.error("Error getting IDs:", error)
    return NextResponse.json({
      customer_id: 1,
      restaurant_id: 1
    })
  }
}
