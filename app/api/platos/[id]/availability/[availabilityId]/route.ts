// app/api/platos/[id]/availability/[availabilityId]/route.ts
import { NextResponse } from 'next/server';
import { DisponibilidadService } from '@/services/DisponibilidadService';

const controller = new DisponibilidadService();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ availabilityId: string }> }
) {
  try {
    const { availabilityId } = await params;
    const id = Number(availabilityId);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const { dayOfWeek, startTime, endTime } = body;

    // --- VALIDACIÓN DE CAMPOS INCOMPLETOS ---
    // En horarios, normalmente necesitas el set completo para validar lógica de negocio
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos para la actualización: dia o tiempo de inicio o tiempo final' }, 
        { status: 400 }
      );
    }
    // ----------------------------------------

    const updated = await controller.update(id, { dayOfWeek, startTime, endTime });
    
    return NextResponse.json({ availability: updated });

  } catch (err: any) {
    console.error(err);
    
    // Determinación dinámica del status code
    let status = 500;
    if (err.message === 'Not found') {
      status = 404;
    } else if (
      err.message.includes('overlaps') || 
      err.message.includes('must be') || 
      err.message.includes('Invalid')
    ) {
      status = 400;
    }

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