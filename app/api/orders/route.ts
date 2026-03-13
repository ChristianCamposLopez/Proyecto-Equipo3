import { NextResponse } from "next/server"
import {db} from "@/config/db"

export async function GET(){

    const result = await db.query(
        "SELECT * FROM orders ORDER BY created_at DESC"
    )

    return NextResponse.json(result.rows)

}