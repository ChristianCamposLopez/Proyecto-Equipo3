// app/api/reembolsos/route.ts
import { NextResponse } from "next/server";
import { ReembolsoController } from "@/controllers/ReembolsoController";

async function getAdminSession() {
  // Reemplazar con tu autenticación real
  return { id: 1, role: "admin" };
}

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const controller = new ReembolsoController();
    const result = await controller.getPendingRefunds();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error en GET /api/reembolsos:", error);
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}