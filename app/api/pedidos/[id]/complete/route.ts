// app/api/pedidos/[id]/complete/route.ts
import { NextResponse } from "next/server";
import { PedidoController } from "@/controllers/pedidoController";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId"); // Opcional: para auditoría

    const { id } = await context.params;
    const pedidoId = Number(id);

    if (isNaN(pedidoId)) {
      return NextResponse.json({ error: "ID de pedido inválido" }, { status: 400 });
    }

    const controller = new PedidoController();
    await controller.completarPedido(pedidoId);

    return NextResponse.json({ message: "Pedido completado" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}