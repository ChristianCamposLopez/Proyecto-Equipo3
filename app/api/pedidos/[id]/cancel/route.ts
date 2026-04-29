// app/api/pedidos/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import { PedidoController } from "@/controllers/pedidoController";

async function getUserFromSession() {
  return { id: 1 };
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const pedidoId = Number(id);

    // --- AÑADE ESTA VALIDACIÓN ---
    if (isNaN(pedidoId)) {
      return NextResponse.json(
        { error: "Invalid order id" }, 
        { status: 400 }
      );
    }
    // ------------------------------

    const controller = new PedidoController();
    const result = await controller.cancelPedido(pedidoId);

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}