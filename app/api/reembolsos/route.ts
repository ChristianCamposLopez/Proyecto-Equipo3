// app/api/reembolsos/route.ts
import { NextResponse } from "next/server";
import { ReembolsoController } from "@/controllers/ReembolsoController";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId"); // Se envía desde el panel de admin

    if (!adminId) {
      return NextResponse.json({ error: "No autorizado. Se requiere adminId" }, { status: 400 });
    }

    const controller = new ReembolsoController();
    const result = await controller.getPendingRefunds();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}