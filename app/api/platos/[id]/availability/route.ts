import { NextResponse } from 'next/server';
import { DisponibilidadController } from '@/controllers/DisponibilidadController';

const controller = new DisponibilidadController();

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
    const availability = await controller.getByProduct(productId);
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