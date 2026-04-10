import { NextResponse } from 'next/server';
import { DisponibilidadController } from '@/controllers/DisponibilidadController';

const controller = new DisponibilidadController();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ availabilityId: string }> }
) {
  try {
    const { availabilityId } = await params;
    const id = Number(availabilityId);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    const body = await request.json();
    const { dayOfWeek, startTime, endTime } = body;
    const updated = await controller.update(id, { dayOfWeek, startTime, endTime });
    return NextResponse.json({ availability: updated });
  } catch (err: any) {
    console.error(err);
    const status = err.message === 'Not found' ? 404 : (err.message.includes('overlaps') ? 400 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ availabilityId: string }> }
) {
  try {
    const { availabilityId } = await params;
    const id = Number(availabilityId);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    await controller.delete(id);
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (err: any) {
    console.error(err);
    const status = err.message === 'Not found' ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}