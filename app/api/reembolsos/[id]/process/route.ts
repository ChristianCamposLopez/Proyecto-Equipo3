// app/api/reembolsos/[id]/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ReembolsoController } from "@/controllers/ReembolsoController";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const orderId = Number(id);
    const body = await req.json();
    const { action, reason, adminId } = body; // Recibimos adminId del body

    if (!adminId) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 400 });
    }

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const controller = new ReembolsoController();

    if (action === "approve") {
      const result = await controller.approveRefund(orderId);
      return NextResponse.json(result);
    } else {
      if (!reason?.trim()) {
        return NextResponse.json({ error: "Motivo de rechazo requerido" }, { status: 400 });
      }
      const result = await controller.rejectRefund(orderId, reason);
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}