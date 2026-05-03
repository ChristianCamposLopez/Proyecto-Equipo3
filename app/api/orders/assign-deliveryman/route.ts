import { NextResponse } from "next/server"
import { RepartidorService } from "@/services/RepartidorService"

const repartidorService = new RepartidorService();

// POST /api/orders/assign-deliveryman
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId } = body;
        if (!orderId) {
            return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
        }
        
        const result = await repartidorService.autoAssign(Number(orderId));
        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        const status = message.includes('no encontrada') ? 404
                      : message.includes('ya tiene') ? 409
                      : message.includes('No hay') ? 503
                      : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
