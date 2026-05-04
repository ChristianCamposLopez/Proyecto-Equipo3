import { NextRequest, NextResponse } from "next/server";
import { DireccionService } from "@/services/DireccionService";

const direccionService = new DireccionService();

export async function GET(request: NextRequest) {
  try {
    const customerId = parseInt(request.nextUrl.searchParams.get("customerId") || "1");
    const addresses = await direccionService.obtenerMisDirecciones(customerId);
    return NextResponse.json(addresses);
  } catch (error) {
    console.error("[GET /api/delivery-addresses]", error);
    return NextResponse.json({ error: "No se pudieron obtener las direcciones" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId = parseInt(body.customerId || "1");
    const address = await direccionService.registrarDireccion(customerId, body);
    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la dirección";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId = parseInt(body.customerId || "1");
    const addressId = Number(body.id);

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return NextResponse.json({ error: "Dirección inválida" }, { status: 400 });
    }

    const address = await direccionService.actualizarDireccion(customerId, addressId, body);
    return NextResponse.json(address);
  } catch (error) {
    console.error("[PATCH /api/delivery-addresses]", error);
    const message = error instanceof Error ? error.message : "No se pudo actualizar la dirección";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "");

    if (!id) {
      return NextResponse.json({ error: "ID de dirección requerido" }, { status: 400 });
    }

    await direccionService.eliminarDireccion(id);
    return NextResponse.json({ message: "Dirección eliminada" });
  } catch (error) {
    console.error("[DELETE /api/delivery-addresses]", error);
    return NextResponse.json({ error: "No se pudo eliminar la dirección" }, { status: 500 });
  }
}
