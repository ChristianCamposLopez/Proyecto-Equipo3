import { NextResponse } from 'next/server';
import { AvailabilityService } from '@/lib/availability.service';

const service = new AvailabilityService();

/* =====================================================
   GET → listar horarios por producto
===================================================== */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product id' },
        { status: 400 }
      );
    }

    const availability = await service.getByProduct(productId);

    return NextResponse.json({ availability });

  } catch (err) {
    console.error('GET availability error', err);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


/* =====================================================
   POST → crear horario
===================================================== */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product id' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { dayOfWeek, startTime, endTime } = body;

    const availability = await service.create({
      productId,
      dayOfWeek,
      startTime,
      endTime
    });

    return NextResponse.json({ availability });

  } catch (err: any) {
    console.error('POST availability error', err);

    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 400 }
    );
  }
}