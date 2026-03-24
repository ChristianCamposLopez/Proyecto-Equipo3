// app/api/platos/[id]/availability/[availabilityId]/route.ts
import { NextResponse } from 'next/server';
import { AvailabilityService } from '@/lib/availability.service';

const service = new AvailabilityService();

/* =====================================================
   PATCH → actualizar horario
===================================================== */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ availabilityId: string }> }
) {
  try {
    const { availabilityId } = await params;
    const id = Number(availabilityId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid id' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { dayOfWeek, startTime, endTime } = body;

    const updated = await service.update(id, {
      dayOfWeek,
      startTime,
      endTime
    });

    return NextResponse.json({ availability: updated });

  } catch (err: any) {
    console.error('PATCH availability error', err);

    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 400 }
    );
  }
}


/* =====================================================
   DELETE → eliminar horario
===================================================== */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ availabilityId: string }> }
) {
  try {
    const { availabilityId } = await params;
    const id = Number(availabilityId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid id' },
        { status: 400 }
      );
    }

    await service.delete(id);

    return NextResponse.json({
      message: 'Deleted successfully'
    });

  } catch (err: any) {
    console.error('DELETE availability error', err);

    if (err.message === 'Not found') {
      return NextResponse.json(
        { error: err.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 400 }
    );
  }
}