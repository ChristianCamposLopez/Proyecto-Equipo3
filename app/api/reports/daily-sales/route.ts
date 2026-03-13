import { NextResponse } from "next/server"
import { getDailySales } from "@/controllers/reportController"

export async function GET(){

    const sales = await getDailySales()

    return NextResponse.json(sales)

}