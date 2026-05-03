import { NextRequest, NextResponse } from "next/server";
import { CarritoService } from "@/services/CarritoService";

const carritoService = new CarritoService();

export async function GET(request: NextRequest) {
  try {
    const customerId = parseInt(request.nextUrl.searchParams.get("customerId") || "1");
    const cart = await carritoService.getSummary(customerId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("[GET /api/cart]", error);
    return NextResponse.json({ error: "No se pudo obtener el carrito" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId = parseInt(body.customerId || "1");
    const productId = Number(body.productId);
    const quantity = Number(body.quantity ?? 1);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: "productId inválido" }, { status: 400 });
    }

    const cart = await carritoService.agregarProducto(customerId, productId, quantity);
    return NextResponse.json(cart, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo agregar el producto";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const customerId = parseInt(request.nextUrl.searchParams.get("customerId") || "1");
    const cart = await carritoService.vaciarCarrito(customerId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("[DELETE /api/cart]", error);
    return NextResponse.json({ error: "No se pudo vaciar el carrito" }, { status: 500 });
  }
}
