// app/api/pedidos/route.ts
import { NextResponse } from "next/server";
import { PedidoController } from "@/controllers/pedidoController";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, customerId, restaurant_id, items } = body;

    if (!orderId || !customerId || !restaurant_id || !items) {
      return NextResponse.json(
        { error: "Faltan datos: orderId, customerId, restaurant_id, items" },
        { status: 400 }
      );
    }

    const controller = new PedidoController();
    await controller.registrarHistorial(orderId, customerId, restaurant_id, items);

    return NextResponse.json({
      message: "Pedido registrado en historial",
      pedidoId: orderId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al registrar historial del pedido" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "customerId es requerido" }, { status: 400 });
    }

    const controller = new PedidoController();
    const pedidos = await controller.getPedidos(Number(customerId));

    return NextResponse.json({ pedidos });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
  }
}