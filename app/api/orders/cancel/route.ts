import { NextResponse } from "next/server"
import { PaymentService } from '@/services/PaymentService'

const paymentService = new PaymentService();

export async function POST(req: Request) {
    const body = await req.json();

    try {
        await paymentService.processRefundForOrder(body.orderId);
        return NextResponse.json({
            message: "Order cancelled and refund processed",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}