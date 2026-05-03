import { NextRequest, NextResponse } from 'next/server';
import { RepartidorService } from '@/services/RepartidorService';

const controller = new RepartidorService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId || isNaN(Number(orderId))) {
      return NextResponse.json({ error: 'Se requiere un orderId numérico' }, { status: 400 });
    }

    const resultado = await controller.autoAssign(Number(orderId));

    return NextResponse.json({
      mensaje: 'RepartidorEntity asignado correctamente',
      repartidor: resultado.repartidor,
      orderId: resultado.orderId,
    });
  } catch (error: any) {
    const status = error.message.includes('no encontrada') ? 404
                  : error.message.includes('ya tiene') ? 409
                  : error.message.includes('No hay') ? 503
                  : 500;
    return NextResponse.json({ error: error.message || 'Error interno' }, { status });
  }
}