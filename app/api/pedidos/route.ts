//app/api/pedidos/route.ts
import { NextResponse } from "next/server";
import { PedidoController } from "@/controllers/pedidoController";

// ⚠️ mock de sesión
async function getUserFromSession() {
  return { id: 1 };
}

// ✅ Crear pedido
export async function POST(request: Request) {
  try {
    const user = await getUserFromSession();
    const body = await request.json();

    const { restaurant_id, items } = body;

    if (!restaurant_id || !items) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const controller = new PedidoController();

    const result = await controller.crearPedido(
      user.id,
      restaurant_id,
      items
    );

    return NextResponse.json({
      message: "Pedido creado",
      pedidoId: result.pedidoId,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear pedido" },
      { status: 500 }
    );
  }
}

// ✅ Obtener pedidos del usuario
export async function GET() {
  try {
    const user = await getUserFromSession();

    const controller = new PedidoController();
    const pedidos = await controller.getPedidos(user.id);

    return NextResponse.json({ pedidos });

  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}