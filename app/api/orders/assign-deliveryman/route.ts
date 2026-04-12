import { NextResponse } from "next/server"
import { assignDeliverymanToOrder } from "@/controllers/orderController"

// POST /api/orders/assign-deliveryman
export async function POST(req: Request) {
    const body = await req.json();
    const { orderId } = body;
    if (!orderId) {
        return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
    }
    try {
        const result = await assignDeliverymanToOrder(orderId);
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
