// app/api/reembolsos/[id]/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ReembolsoController } from "@/controllers/ReembolsoController";

async function getAdminSession() {
  return { id: 1, role: "admin" };
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id } = await params; // 👈 solución

  const orderId = Number(id);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  try {
    const admin = await getAdminSession();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = Number(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const { action, reason } = body;

    if (!action || (action !== "approve" && action !== "reject")) {
      return NextResponse.json(
        { error: "Acción inválida. Use 'approve' o 'reject'" },
        { status: 400 }
      );
    }

    const controller = new ReembolsoController();

    if (action === "approve") {
      const result = await controller.approveRefund(orderId);
      return NextResponse.json(result);
    } else {
      if (!reason || typeof reason !== "string" || reason.trim() === "") {
        return NextResponse.json(
          { error: "Debe proporcionar un motivo de rechazo" },
          { status: 400 }
        );
      }
      const result = await controller.rejectRefund(orderId, reason);
      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.error("Error en PATCH /api/reembolsos/[id]/process:", error);
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}