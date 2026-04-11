import { NextResponse } from "next/server"
import { getDailySales } from "@/controllers/reportController"

export async function GET(){
  try {
    const sales = await getDailySales()
    return NextResponse.json(sales || [], { status: 200 })
  } catch (error) {
    console.error('[GET /api/reports/daily-sales]', error)
    return NextResponse.json([], { status: 200 })
  }
}