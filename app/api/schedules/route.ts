// app/api/schedules/route.ts
// API Route — US020.1: Alta de horarios | US020.4: Consulta de horarios

import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '@/services/ScheduleService';

const scheduleService = new ScheduleService();

/**
 * GET /api/schedules
 * US020.4: Lista todos los horarios con info de producto.
 */
export async function GET() {
  try {
    const schedules = await scheduleService.getAll();
    return NextResponse.json(schedules);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}

/**
 * POST /api/schedules
 * US020.1: Crea un nuevo rango horario.
 * Body: { product_id, day_of_week, start_time, end_time }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, day_of_week, start_time, end_time } = body;

    if (!product_id || day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Campos requeridos: product_id, day_of_week, start_time, end_time' },
        { status: 400 }
      );
    }

    const schedule = await scheduleService.create(
      product_id,
      day_of_week,
      start_time,
      end_time
    );

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }
}
