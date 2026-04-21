import { NextRequest, NextResponse } from "next/server";
import { resolveCustomerId } from "@/lib/cart";
import {
  createDeliveryAddress,
  listDeliveryAddresses,
  updateDeliveryAddress,
} from "@/lib/deliveryAddresses";

export async function GET(request: NextRequest) {
  try {
    const customerId = resolveCustomerId(request.nextUrl.searchParams.get("customerId"));
    const addresses = await listDeliveryAddresses(customerId);
    return NextResponse.json(addresses);
  } catch (error) {
    console.error("[GET /api/delivery-addresses]", error);
    return NextResponse.json({ error: "No se pudieron obtener las direcciones" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId = resolveCustomerId(body.customerId);
    const address = await createDeliveryAddress(customerId, body);
    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la dirección";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId = resolveCustomerId(body.customerId);
    const addressId = Number(body.id);

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return NextResponse.json({ error: "Dirección inválida" }, { status: 400 });
    }

    const address = await updateDeliveryAddress(customerId, addressId, body);
    return NextResponse.json(address);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar la dirección";
    const status = message.includes("no encontrada") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
