import { NextRequest, NextResponse } from "next/server";
import {
  addItemToCart,
  buildCartSummary,
  clearCart,
  resolveCustomerId,
} from "@/lib/cart";

export async function GET(request: NextRequest) {
  try {
    const customerId = resolveCustomerId(request.nextUrl.searchParams.get("customerId"));
    const cart = await buildCartSummary(customerId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("[GET /api/cart]", error);
    return NextResponse.json({ error: "No se pudo obtener el carrito" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId = resolveCustomerId(body.customerId);
    const productId = Number(body.productId);
    const quantity = Number(body.quantity ?? 1);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: "productId inválido" }, { status: 400 });
    }

    const cart = await addItemToCart(customerId, productId, quantity);
    return NextResponse.json(cart, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo agregar el producto";
    const status = message.includes("no encontrado") || message.includes("inválido") ? 400 : 409;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const customerId = resolveCustomerId(request.nextUrl.searchParams.get("customerId"));
    const cart = await clearCart(customerId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("[DELETE /api/cart]", error);
    return NextResponse.json({ error: "No se pudo vaciar el carrito" }, { status: 500 });
  }
}
