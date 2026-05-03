// app/api/pedidos/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import { PedidoController } from "@/controllers/pedidoController";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pedidoId = Number(id);

    if (isNaN(pedidoId)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const controller = new PedidoController();
    // El controlador ya maneja la lógica de negocio interna
    const result = await controller.cancelPedido(pedidoId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error canceling order:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}