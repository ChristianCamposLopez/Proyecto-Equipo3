// app/api/schedules/[id]/route.ts
// API Route — US020.2: Editar horario | US020.3: Eliminar horario

import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '@/services/ScheduleService';

const scheduleService = new ScheduleService();

/**
 * PUT /api/schedules/[id]
 * US020.2: Edita un rango horario existente.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { day_of_week, start_time, end_time } = body;

    if (day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Campos requeridos: day_of_week, start_time, end_time' },
        { status: 400 }
      );
    }

    const schedule = await scheduleService.update(
      parseInt(id, 10),
      day_of_week,
      start_time,
      end_time
    );

    return NextResponse.json(schedule);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    const status = mensaje.includes('no encontrado') ? 404 : 400;
    return NextResponse.json({ error: mensaje }, { status });
  }
}

/**
 * DELETE /api/schedules/[id]
 * US020.3: Elimina un rango horario.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await scheduleService.delete(parseInt(id, 10));
    return NextResponse.json({ message: 'Horario eliminado correctamente' });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    const status = mensaje.includes('no encontrado') ? 404 : 500;
    return NextResponse.json({ error: mensaje }, { status });
  }
}
