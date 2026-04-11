// app/api/pedidos/[id]/complete/route.ts
import { NextResponse } from "next/server";
import { PedidoController } from "@/controllers/pedidoController";

// ⚠️ Simulación de auth (igual que usas en recomendaciones)
async function getUserFromSession() {
  return { id: 1 }; // mock
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid order id" },
        { status: 400 }
      );
    }

    const controller = new PedidoController();

    await controller.completarPedido(Number(id));

    return NextResponse.json({
      message: "Pedido completado",
    });

  } catch (error: any) {
    console.error("Error al completar pedido:", error);

    return NextResponse.json(
      {
        error: error.message || "Server error",
      },
      { status: 500 }
    );
  }
}