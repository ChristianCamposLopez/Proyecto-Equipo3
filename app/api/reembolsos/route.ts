// app/api/reembolsos/route.ts
// US026: Gestión de Reembolsos
import { NextRequest, NextResponse } from "next/server";
import { ReembolsoService } from "@/services/ReembolsoService";

const reembolsoService = new ReembolsoService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = parseInt(searchParams.get("restaurantId") || "1");
    const type = searchParams.get("type") || "pending";
    const limit = parseInt(searchParams.get("limit") || "50");

    let result;
    if (type === "pending") {
      result = await reembolsoService.getPendingRefunds(restaurantId);
    } else if (type === "history") {
      result = await reembolsoService.getRefundHistory(restaurantId, limit);
    } else if (type === "stats") {
      result = await reembolsoService.getRefundStats(restaurantId);
    } else {
      return NextResponse.json({ error: "Tipo no válido" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, reason } = body;

    const refund = await reembolsoService.initiateRefund(orderId, amount, reason);
    return NextResponse.json(refund, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al iniciar reembolso" }, { status: 500 });
  }
}