import { NextResponse } from "next/server";
import { PedidoService } from '@/services/PedidoService';

const pedidoService = new PedidoService();

// GET /api/pedidos: Obtiene historial de pedidos del cliente (US027)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "customerId es requerido" }, { status: 400 });
    }

    const pedidos = await pedidoService.getPedidos(Number(customerId));

    return NextResponse.json({ pedidos });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
  }
}