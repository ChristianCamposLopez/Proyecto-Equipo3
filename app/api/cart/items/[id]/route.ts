import { NextRequest, NextResponse } from "next/server";
import {
  removeCartItem,
  resolveCustomerId,
  updateCartItemQuantity,
} from "@/lib/cart";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const customerId = resolveCustomerId(body.customerId);
    const quantity = Number(body.quantity);
    const cartItemId = Number(id);

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return NextResponse.json({ error: "Elemento inválido" }, { status: 400 });
    }

    const cart = await updateCartItemQuantity(customerId, cartItemId, quantity);
    return NextResponse.json(cart);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el carrito";
    const status = message.includes("no encontrado") ? 404 : 409;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const customerId = resolveCustomerId(request.nextUrl.searchParams.get("customerId"));
    const cartItemId = Number(id);

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return NextResponse.json({ error: "Elemento inválido" }, { status: 400 });
    }

    const cart = await removeCartItem(customerId, cartItemId);
    return NextResponse.json(cart);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar el producto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
