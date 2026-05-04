// app/api/platos/[id]/availability/route.ts
import { NextResponse } from 'next/server';
import { DisponibilidadService } from '@/services/DisponibilidadService';

const controller = new DisponibilidadService();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
    }
    const availability = await controller.getByProductoEntity(productId);
    return NextResponse.json({ availability });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
    }

    const body = await request.json();
    const { dayOfWeek, startTime, endTime } = body;
    console.log('Received data:', { dayOfWeek, startTime, endTime }); 
    // --- AGREGA ESTA VALIDACIÓN ---
    if (dayOfWeek == null || startTime == null || endTime == null) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: dayOfWeek, startTime y endTime' }, 
        { status: 400 }
      );
    }

    const availability = await controller.create({
      productId,
      dayOfWeek,
      startTime,
      endTime
    });
    return NextResponse.json({ availability });
  } catch (err: any) {
    console.error(err);
    const status = err.message.includes('overlaps') || err.message.includes('must be') ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}