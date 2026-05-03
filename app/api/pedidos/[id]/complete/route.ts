// app/api/pedidos/[id]/complete/route.ts
import { NextResponse } from "next/server";
import { PedidoService } from '@/services/PedidoService';

const pedidoService = new PedidoService();

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

    await pedidoService.completarPedido(pedidoId);

    return NextResponse.json({ message: "PedidoEntity completado" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}